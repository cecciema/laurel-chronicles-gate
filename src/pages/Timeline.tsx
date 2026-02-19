import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { HiddenOrb, useGame } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import { timeline, type TimelineEvent } from "@/data/world-data";

const categoryColors: Record<TimelineEvent["category"], string> = {
  political: "bg-primary/20 text-primary",
  military: "bg-destructive/20 text-destructive",
  social: "bg-accent/20 text-accent",
  technological: "bg-brass-glow/20 text-brass-glow",
};

// ─── Cipher Constants ──────────────────────────────────────────────────────────
const SHIFT = 7;
const PLAINTEXT = "THE APOTHEOSIS IS NOT SALVATION. THE SOULS ARE BEING COLLECTED. THE CONVOY KNOWS WHERE THEY GO.";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MAX_WRONG = 3;
const TIMER_SECONDS = 90;
const SCROLL_ID = 8; // cipher awards Scroll 8 — "The Embedded Operatives"

function caesarEncode(text: string, shift: number): string {
  return text
    .split("")
    .map((ch) => {
      const idx = ALPHABET.indexOf(ch);
      if (idx === -1) return ch;
      return ALPHABET[(idx + shift) % 26];
    })
    .join("");
}

const CIPHERTEXT = caesarEncode(PLAINTEXT, SHIFT);

// Split into word pairs: { encoded, decoded }
// We keep punctuation attached to the word it belongs to
const WORD_PAIRS: { encoded: string; decoded: string }[] = (() => {
  const plainWords = PLAINTEXT.split(" ");
  const cipherWords = CIPHERTEXT.split(" ");
  return plainWords.map((plain, i) => ({
    decoded: plain,
    encoded: cipherWords[i] ?? plain,
  }));
})();

// ─── The Silencer SVG silhouette ──────────────────────────────────────────────
const SilencerFigure = ({ step }: { step: number }) => {
  // step 0..3 — moves from right edge toward center
  const rightPercent = 100 - step * 28; // 100%, 72%, 44%, 16%
  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-10 flex items-end"
      style={{
        right: `${Math.max(2, 100 - rightPercent)}%`,
        transition: "right 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <motion.div
        animate={{ opacity: step > 0 ? [0.55, 0.75, 0.55] : 0.45 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="36"
          height="110"
          viewBox="0 0 36 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Wide-brimmed hat */}
          <ellipse cx="18" cy="14" rx="16" ry="4" fill="hsl(20 8% 16%)" />
          <rect x="10" y="8" width="16" height="10" rx="2" fill="hsl(20 8% 14%)" />
          {/* Head */}
          <ellipse cx="18" cy="22" rx="7" ry="8" fill="hsl(20 8% 10%)" />
          {/* Long coat body */}
          <path
            d="M10 30 Q6 55 5 90 L8 90 L10 60 L18 65 L26 60 L28 90 L31 90 Q30 55 26 30 Z"
            fill="hsl(20 8% 10%)"
          />
          {/* Coat collar / shoulders */}
          <path d="M10 30 Q18 36 26 30 L24 45 L18 48 L12 45 Z" fill="hsl(20 8% 13%)" />
          {/* Left arm */}
          <path d="M10 32 Q4 50 3 68 L7 68 Q8 52 12 38 Z" fill="hsl(20 8% 11%)" />
          {/* Right arm */}
          <path d="M26 32 Q32 50 33 68 L29 68 Q28 52 24 38 Z" fill="hsl(20 8% 11%)" />
          {/* Legs */}
          <rect x="11" y="88" width="6" height="20" rx="1" fill="hsl(20 8% 10%)" />
          <rect x="19" y="88" width="6" height="20" rx="1" fill="hsl(20 8% 10%)" />
          {/* Faint hat brim shadow */}
          <ellipse cx="18" cy="14" rx="16" ry="4" fill="hsl(20 6% 8%)" opacity="0.5" />
        </svg>
      </motion.div>
    </div>
  );
};

// ─── Cipher key reference — 8 of 26 mappings revealed ────────────────────────
// Shift = 7, so encoded = plain + 7. We pick 8 strategically spread letters.
const CIPHER_KEY_HINTS: { encoded: string; decoded: string }[] = [
  { encoded: "H", decoded: "A" },
  { encoded: "L", decoded: "E" },
  { encoded: "P", decoded: "I" },
  { encoded: "U", decoded: "N" },
  { encoded: "V", decoded: "O" },
  { encoded: "A", decoded: "T" },
  { encoded: "B", decoded: "U" },
  { encoded: "F", decoded: "Y" },
];

// ─── Hint helpers ─────────────────────────────────────────────────────────────
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

function buildHint(decoded: string, tier: 0 | 1 | 2): string {
  // Strip punctuation for hint building, reattach at end
  const letters = decoded.replace(/[^A-Z]/g, "");
  if (tier === 0) {
    // Blank dashes — one per letter
    return letters.split("").map(() => "_").join(" ");
  }
  if (tier === 1) {
    // Reveal first and last, dash middle
    return letters
      .split("")
      .map((ch, i) => (i === 0 || i === letters.length - 1 ? ch : "_"))
      .join(" ");
  }
  // tier 2 — reveal consonants, hide vowels
  return letters
    .split("")
    .map((ch) => (VOWELS.has(ch) ? "_" : ch))
    .join(" ");
}

// ─── Forbidden Transmission Game ──────────────────────────────────────────────
type GamePhase = "playing" | "won" | "lost";

const ForbiddenTransmission = () => {
  const { foundScrolls, foundScroll } = useGame();
  // Word-by-word state
  const [wordIndex, setWordIndex] = useState(0);       // which word we're on
  const [lockedWords, setLockedWords] = useState<string[]>([]); // correctly decoded so far
  const [inputValue, setInputValue] = useState("");
  const [shakeInput, setShakeInput] = useState(false);
  // wrongAttempts = total across all words (drives Silencer)
  const [wrongAttempts, setWrongAttempts] = useState(0);
  // wordWrongAttempts = wrong attempts on the CURRENT word only (drives hint tier)
  const [wordWrongAttempts, setWordWrongAttempts] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [blackout, setBlackout] = useState(false);
  const [bestiaryUnlocked, setBestiaryUnlocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const alreadyWon = foundScrolls.includes(SCROLL_ID);
  const currentPair = WORD_PAIRS[wordIndex];

  // Derive current hint tier (0 = no guess yet, 1 = after 1st wrong, 2 = after 2nd wrong)
  const hintTier = Math.min(wordWrongAttempts, 2) as 0 | 1 | 2;
  const hintDisplay = currentPair ? buildHint(currentPair.decoded.replace(/[^A-Z]/g, ""), hintTier) : null;

  // ── Timer
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          triggerLoss();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  const triggerLoss = () => {
    setBlackout(true);
    setTimeout(() => {
      setBlackout(false);
      setPhase("lost");
    }, 3000);
  };

  const advanceWord = (locked: string[], nextIdx: number) => {
    setLockedWords(locked);
    setInputValue("");
    setWordWrongAttempts(0);
    if (nextIdx >= WORD_PAIRS.length) {
      clearInterval(timerRef.current!);
      setPhase("won");
      setBestiaryUnlocked(true);
      if (!alreadyWon) foundScroll(SCROLL_ID);
    } else {
      setWordIndex(nextIdx);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleDecode = useCallback(() => {
    if (phase !== "playing" || !currentPair) return;
    const typed = inputValue.trim().toUpperCase();
    const expected = currentPair.decoded.replace(/[^A-Z]/g, "");
    const typedClean = typed.replace(/[^A-Z]/g, "");

    if (typedClean === expected) {
      // Correct — advance, reset per-word counter
      advanceWord([...lockedWords, currentPair.decoded], wordIndex + 1);
    } else {
      // Wrong
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 600);
      setInputValue("");

      const nextWordWrong = wordWrongAttempts + 1;
      const nextTotal = wrongAttempts + 1;
      setWrongAttempts(nextTotal);

      if (nextWordWrong >= 3) {
        // Third wrong on this word — auto-reveal, lock in, Silencer step
        setWordWrongAttempts(0);
        advanceWord([...lockedWords, currentPair.decoded], wordIndex + 1);
        // Silencer already stepped via wrongAttempts; check loss threshold
        if (nextTotal >= MAX_WRONG) {
          clearInterval(timerRef.current!);
          triggerLoss();
        }
      } else {
        setWordWrongAttempts(nextWordWrong);
        if (nextTotal >= MAX_WRONG) {
          clearInterval(timerRef.current!);
          triggerLoss();
        }
      }
    }
  }, [phase, currentPair, inputValue, lockedWords, wordIndex, wrongAttempts, wordWrongAttempts, alreadyWon, foundScroll]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleDecode(); }
  };

  const handleRestart = () => {
    setWordIndex(0);
    setLockedWords([]);
    setInputValue("");
    setShakeInput(false);
    setWrongAttempts(0);
    setWordWrongAttempts(0);
    setPhase("playing");
    setTimeLeft(TIMER_SECONDS);
  };

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor =
    timeLeft > 45
      ? "hsl(38 72% 50%)"
      : timeLeft > 20
      ? "hsl(25 80% 45%)"
      : "hsl(0 65% 48%)";

  return (
    <section className="py-16 sm:py-20 px-4">
      {/* Steampunk divider */}
      <div className="max-w-2xl mx-auto mb-12 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="flex items-center gap-2 px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary/60">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" />
            <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1" />
            <path d="M10 2v4M10 14v4M2 10h4M14 10h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Title */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl tracking-[0.12em] text-primary"
        >
          Forbidden Transmission
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-3 font-narrative italic text-muted-foreground text-[0.9375rem] leading-[1.8]"
        >
          A Convoy message has been intercepted. Decode it before the signal is traced. Once they find you, they will erase you from the record entirely.
        </motion.p>
      </div>

      {/* Game container */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto bg-card border border-border relative overflow-hidden"
        style={{ minHeight: 340 }}
      >
        {/* Blackout overlay */}
        <AnimatePresence>
          {blackout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background z-40"
            />
          )}
        </AnimatePresence>

        {/* Lost screen */}
        <AnimatePresence>
          {phase === "lost" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/96 flex flex-col items-center justify-center z-30 gap-6 p-8 text-center"
            >
              <p className="font-display text-xs tracking-[0.25em] text-destructive uppercase">Signal Traced</p>
              <p className="font-narrative italic text-foreground/70 text-[0.9375rem] leading-[1.8] max-w-sm">
                The transmission has been traced. The Silencer has found you. There is no record you were ever here.
              </p>
              <button
                onClick={handleRestart}
                className="px-8 py-2.5 border border-primary text-primary font-body text-xs tracking-widest uppercase hover:bg-primary/10 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Won screen */}
        <AnimatePresence>
          {phase === "won" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/93 flex flex-col items-center justify-center z-30 gap-5 p-8 text-center"
            >
              <p className="font-display text-xs tracking-[0.25em] text-primary uppercase">Transmission Decoded</p>
              <p className="font-narrative italic text-foreground/70 text-[0.9375rem] leading-[1.8] max-w-sm">
                Transmission decoded. The truth has been recorded. A scroll fragment has been added to your collection.
              </p>
              {!alreadyWon && (
                <Link
                  to="/bestiary"
                  className="font-body text-[10px] tracking-[0.25em] uppercase transition-colors"
                  style={{ color: "hsl(38 72% 50%)" }}
                >
                  A new entry has been added to the Bestiary.
                </Link>
              )}
              <div className="w-8 h-px bg-primary/40" />
              <button
                onClick={handleRestart}
                className="px-8 py-2.5 border border-border text-muted-foreground font-body text-xs tracking-widest uppercase hover:border-primary/40 hover:text-primary transition-colors"
              >
                Transmit Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Playing state */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">

          {/* Timer + wrong attempts bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase font-body">Signal life</span>
                <span
                  className="font-display text-sm tabular-nums"
                  style={{ color: timerColor }}
                >
                  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
                </span>
              </div>
              <div className="h-1.5 bg-secondary border border-border/50 overflow-hidden">
                <motion.div
                  className="h-full transition-all duration-1000"
                  style={{ width: `${timerPct}%`, background: timerColor }}
                />
              </div>
            </div>

            {/* Wrong attempt dots */}
            <div className="flex gap-1.5 flex-shrink-0">
              {Array.from({ length: MAX_WRONG }).map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border transition-all duration-300"
                  style={{
                    background: i < wrongAttempts ? "hsl(0 65% 48%)" : "transparent",
                    borderColor: i < wrongAttempts ? "hsl(0 65% 48%)" : "hsl(38 20% 25%)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Silencer arena */}
          <div
            className="relative border border-border/40 bg-background/40 overflow-hidden"
            style={{ height: 120 }}
          >
            {/* Ground line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-border/30" />

            {/* Distant city silhouette */}
            <div className="absolute bottom-px left-0 right-0 pointer-events-none opacity-10">
              {[8, 16, 10, 20, 14, 24, 12, 18, 9, 22, 15, 11, 19].map((h, i) => (
                <div
                  key={i}
                  className="inline-block bg-foreground/80"
                  style={{
                    width: 22,
                    height: h,
                    marginRight: 4,
                    verticalAlign: "bottom",
                  }}
                />
              ))}
            </div>

            {/* Silencer */}
            <SilencerFigure step={wrongAttempts} />

            {/* Label */}
            <div className="absolute top-2 left-3 pointer-events-none">
              <p className="text-[8px] tracking-[0.3em] text-muted-foreground/30 uppercase font-body">
                The Silencer
              </p>
            </div>

            {/* Warning when close */}
            {wrongAttempts >= 2 && phase === "playing" && (
              <motion.p
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute top-2 right-3 text-[8px] tracking-widest text-destructive uppercase font-body"
              >
                ◉ Proximity critical
              </motion.p>
            )}
          </div>

          {/* ── Previously decoded words ── */}
          {lockedWords.length > 0 && (
            <div className="bg-background/30 border border-border/30 p-3">
              <p className="text-[8px] tracking-[0.3em] text-muted-foreground/40 uppercase font-body mb-1.5">
                Decoded so far
              </p>
              <p className="font-body text-[11px] sm:text-xs tracking-[0.15em] leading-[2]" style={{ color: "hsl(38 72% 60%)" }}>
                {lockedWords.join(" ")}
              </p>
            </div>
          )}

          {/* ── Current word to decode ── */}
          {phase === "playing" && currentPair && (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[8px] tracking-[0.3em] text-muted-foreground/50 uppercase font-body mb-1.5">
                  Current word · {wordIndex + 1} of {WORD_PAIRS.length}
                </p>
                <div className="bg-background/60 border border-border/40 px-4 py-3 text-center">
                  <span className="font-display text-xl sm:text-2xl tracking-[0.25em] text-primary/90">
                    {currentPair.encoded}
                  </span>
                </div>
              </div>

              {/* Three-tier hint display — always shown */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`hint-${wordIndex}-${hintTier}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-1"
                >
                  {/* Dash/letter hint */}
                  <p
                    className="font-display text-sm tracking-[0.4em] text-center"
                    style={{ color: "hsl(38 60% 55%)" }}
                  >
                    {hintDisplay}
                  </p>
                  {/* Tier label */}
                  <p className="text-[8px] tracking-[0.25em] text-muted-foreground/40 uppercase font-body">
                    {hintTier === 0 && `${currentPair.decoded.replace(/[^A-Z]/g, "").length} letters`}
                    {hintTier === 1 && "◈ First & last letter revealed"}
                    {hintTier === 2 && "◈ Consonants revealed"}
                  </p>
                  {/* Tier 3 auto-reveal notice */}
                  {wordWrongAttempts === 2 && (
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-[8px] tracking-[0.2em] font-body uppercase"
                      style={{ color: "hsl(0 65% 55%)" }}
                    >
                      ⚠ One more miss reveals the word — Silencer advances
                    </motion.p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Input + decode button */}
              <motion.div
                animate={shakeInput ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="Type the decoded word…"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="flex-1 bg-background/60 border border-border/60 px-3 py-2.5 font-body text-xs tracking-widest text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 uppercase"
                  style={{ minHeight: 44 }}
                  disabled={phase !== "playing"}
                />
                <button
                  onClick={handleDecode}
                  disabled={phase !== "playing" || !inputValue.trim()}
                  className="px-5 py-2.5 border font-body text-[10px] tracking-widest uppercase transition-all disabled:opacity-40 hover:bg-primary/10"
                  style={{
                    borderColor: "hsl(38 72% 50%)",
                    color: "hsl(38 72% 55%)",
                    minHeight: 44,
                  }}
                >
                  Decode
                </button>
              </motion.div>

              {/* ── Cipher Key Reference Panel ── */}
              <div className="border border-border/30 bg-background/20 px-3 py-2.5 mt-1">
                <p className="text-[7px] tracking-[0.3em] text-muted-foreground/40 uppercase font-body mb-2">
                  Intercepted Cipher Key — partial decode
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {CIPHER_KEY_HINTS.map(({ encoded, decoded }) => (
                    <div key={encoded} className="flex flex-col items-center gap-0.5">
                      <span
                        className="font-display text-[11px] tracking-wider"
                        style={{ color: "hsl(38 50% 45%)" }}
                      >
                        {encoded}
                      </span>
                      <div className="w-px h-2.5 bg-border/40" />
                      <span className="font-display text-[11px] tracking-wider text-foreground/60">
                        {decoded}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[7px] tracking-[0.2em] text-muted-foreground/30 uppercase font-body mt-2">
                  Encoded → Decoded · 8 of 26 pairs recovered
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer note */}
      <p className="max-w-2xl mx-auto mt-2 text-[9px] tracking-[0.2em] text-muted-foreground/30 font-body text-right px-1 uppercase">
        Caesar cipher · type each decoded word · wrong = Silencer advances
      </p>

      {/* Bestiary Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto mt-10 border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          {/* Silencer icon */}
          <div className="flex-shrink-0 w-12 h-14 border border-border flex items-end justify-center pb-1 overflow-hidden">
            {bestiaryUnlocked || alreadyWon ? (
              <svg width="20" height="40" viewBox="0 0 20 40" fill="none">
                <ellipse cx="10" cy="5" rx="7" ry="2.5" fill="hsl(38 20% 22%)" />
                <rect x="6" y="3" width="8" height="6" rx="1" fill="hsl(38 20% 18%)" />
                <ellipse cx="10" cy="11" rx="4" ry="4.5" fill="hsl(38 20% 14%)" />
                <path d="M5 15 Q3 27 3 38 L5 38 L6 26 L10 28 L14 26 L15 38 L17 38 Q17 27 15 15 Z" fill="hsl(38 20% 12%)" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-border mb-1">
                <rect x="3" y="7" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[9px] tracking-[0.3em] text-primary uppercase font-body mb-1">
              Bestiary · Transmission Entity
            </p>
            <h3 className="font-display text-base tracking-wide text-foreground">
              The Silencer
            </h3>
            <div className="mt-3 relative">
              <p
                className="font-narrative text-[0.875rem] text-foreground/70 leading-[1.8] transition-all duration-700"
                style={{
                  filter: bestiaryUnlocked || alreadyWon ? "none" : "blur(4px)",
                  userSelect: bestiaryUnlocked || alreadyWon ? "text" : "none",
                }}
              >
                There are 7 known gaps in the official Panterra Timeline between the Great War and the present day. Historians who investigated 4 of them are no longer practicing. The other 3 investigators retired early, citing health reasons, within the same calendar month.
              </p>
              {!(bestiaryUnlocked || alreadyWon) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase font-body">
                    Decode the transmission to unlock
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// ─── Main Timeline Page ────────────────────────────────────────────────────────
const TimelinePage = () => {
  const [filter, setFilter] = useState<TimelineEvent["category"] | "all">("all");
  const filtered = filter === "all" ? timeline : timeline.filter((e) => e.category === filter);

  return (
    <Layout>
      <div className="pt-24 pb-20 px-4 overflow-x-hidden">
        <SectionHeader
          title="Timeline of the Empire"
          subtitle="Three centuries of ambition, conflict, and transformation"
        />

        {/* Filter */}
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2 mb-12">
          {(["all", "political", "military", "social", "technological"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`min-h-[44px] px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-body border transition-colors ${
                filter === cat
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line — on mobile always left-aligned */}
          <div className="absolute left-5 sm:left-1/2 top-0 bottom-0 w-px bg-border" />
          {/* Hidden Orb 2 — Timeline page scroll */}
          <HiddenOrb id={2} className="absolute left-[14px] sm:left-[calc(50%-6px)] top-[-12px] z-20" />

          <div className="space-y-8">
            {filtered.map((event, i) => (
              <motion.div
                key={event.year + event.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative flex items-start"
              >
                {/* Dot */}
                <div className="absolute left-5 sm:left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-background rounded-full z-10 mt-1" />

                {/* Content — always left-indented on mobile */}
                <div className="ml-12 sm:ml-0 sm:w-[calc(50%-2rem)] sm:even:ml-auto sm:even:pl-8 sm:odd:pr-8 sm:odd:text-right w-full">
                  <span className={`inline-block px-2 py-0.5 text-[9px] tracking-wider uppercase font-body rounded-sm ${categoryColors[event.category]}`}>
                    {event.category}
                  </span>
                  <h3 className="font-display text-[0.9375rem] sm:text-sm tracking-wide text-foreground mt-2">
                    {event.title}
                  </h3>
                  <p className="text-[10px] tracking-[0.2em] text-primary font-body mt-1">
                    {event.year}
                  </p>
                  <p className="mt-2 text-[0.9375rem] sm:text-sm text-muted-foreground font-body leading-[1.8]">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Forbidden Transmission game */}
        <ForbiddenTransmission />
      </div>
    </Layout>
  );
};

export default TimelinePage;
