import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
const SCROLL_ID = 2; // cipher awards Scroll 2 — "The Convoy's Origin"

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

function caesarDecode(text: string, shift: number): string {
  return caesarEncode(text, 26 - (shift % 26));
}

const CIPHERTEXT = caesarEncode(PLAINTEXT, SHIFT);

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

// ─── Decoder Wheel ────────────────────────────────────────────────────────────
interface DecoderWheelProps {
  userShift: number;
  onChange: (shift: number) => void;
  disabled: boolean;
}

const DecoderWheel = ({ userShift, onChange, disabled }: DecoderWheelProps) => {
  const prev = (s: number) => onChange((s + 25) % 26);
  const next = (s: number) => onChange((s + 1) % 26);

  const visibleCount = 7;
  const halfVisible = Math.floor(visibleCount / 2);

  // Show a window of decoded letters centred on current shift
  const windowLetters = Array.from({ length: visibleCount }, (_, i) => {
    const offset = i - halfVisible;
    const shiftedShift = (userShift + offset + 26) % 26;
    const letter = ALPHABET[shiftedShift];
    const isCentre = i === halfVisible;
    return { letter, isCentre, shiftedShift };
  });

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(userShift); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(userShift); }
    },
    [userShift, disabled]
  );

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <p className="text-[9px] tracking-[0.3em] text-muted-foreground/60 uppercase font-body">
        Shift decoder · align to reveal plaintext
      </p>
      <div className="flex items-center gap-2">
        {/* Decrease shift */}
        <button
          onClick={() => prev(userShift)}
          disabled={disabled}
          aria-label="Shift left"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-border text-primary hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-30 font-body text-lg"
        >
          ‹
        </button>

        {/* Letter window */}
        <div
          className="flex items-center overflow-hidden border border-border bg-card"
          style={{ width: `${visibleCount * 44}px`, height: 56 }}
          tabIndex={0}
          onKeyDown={handleKey}
          aria-label="Decoder wheel"
        >
          {windowLetters.map(({ letter, isCentre }, i) => (
            <div
              key={i}
              className={`flex-shrink-0 flex items-center justify-center transition-all duration-150 ${
                isCentre
                  ? "font-display text-2xl text-primary border-x border-primary/40 bg-primary/8"
                  : "font-display text-base text-muted-foreground/30"
              }`}
              style={{ width: 44, height: 56 }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Increase shift */}
        <button
          onClick={() => next(userShift)}
          disabled={disabled}
          aria-label="Shift right"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-border text-primary hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-30 font-body text-lg"
        >
          ›
        </button>
      </div>

      {/* Shift indicator */}
      <p className="text-[9px] tracking-[0.25em] text-muted-foreground/40 font-body uppercase">
        Shift: {userShift} · Decoding with: {ALPHABET[(userShift + 26) % 26]}→A
      </p>
    </div>
  );
};

// ─── Forbidden Transmission Game ──────────────────────────────────────────────
type GamePhase = "playing" | "won" | "lost";

const ForbiddenTransmission = () => {
  const { foundScrolls, foundScroll } = useGame();
  const [userShift, setUserShift] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [blackout, setBlackout] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bestiaryUnlocked, setBestiaryUnlocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const alreadyWon = foundScrolls.includes(SCROLL_ID);

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

  const handleSubmit = () => {
    if (submitted || phase !== "playing") return;
    const decoded = caesarDecode(CIPHERTEXT, userShift);
    if (decoded.trim() === PLAINTEXT.trim()) {
      clearInterval(timerRef.current!);
      setPhase("won");
      setBestiaryUnlocked(true);
      if (!alreadyWon) foundScroll(SCROLL_ID);
    } else {
      const next = wrongAttempts + 1;
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 1200);
      setWrongAttempts(next);
      if (next >= MAX_WRONG) {
        clearInterval(timerRef.current!);
        triggerLoss();
      }
    }
  };

  const handleRestart = () => {
    setUserShift(0);
    setWrongAttempts(0);
    setPhase("playing");
    setTimeLeft(TIMER_SECONDS);
    setSubmitted(false);
  };

  const decoded = caesarDecode(CIPHERTEXT, userShift);
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

          {/* Encoded message */}
          <div>
            <p className="text-[9px] tracking-[0.3em] text-muted-foreground/50 uppercase font-body mb-2">
              Intercepted ciphertext
            </p>
            <div className="bg-background/60 border border-border/40 p-3 font-body text-[11px] sm:text-xs tracking-[0.15em] text-primary/80 leading-[2] break-all">
              {CIPHERTEXT}
            </div>
          </div>

          {/* Live decoded preview */}
          <div>
            <p className="text-[9px] tracking-[0.3em] text-muted-foreground/50 uppercase font-body mb-2">
              Decoded output
            </p>
            <div
              className="bg-background/60 border p-3 font-body text-[11px] sm:text-xs tracking-[0.15em] leading-[2] break-all transition-colors duration-300"
              style={{
                borderColor:
                  submitted
                    ? "hsl(0 65% 48% / 0.6)"
                    : decoded === PLAINTEXT
                    ? "hsl(38 72% 50% / 0.5)"
                    : "hsl(38 20% 20%)",
                color:
                  decoded === PLAINTEXT
                    ? "hsl(38 72% 65%)"
                    : "hsl(38 25% 55%)",
              }}
            >
              {decoded}
            </div>
          </div>

          {/* Decoder wheel */}
          <DecoderWheel
            userShift={userShift}
            onChange={setUserShift}
            disabled={phase !== "playing"}
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={phase !== "playing" || submitted}
            className="w-full py-3 border font-body text-xs tracking-widest uppercase transition-all disabled:opacity-40"
            style={{
              borderColor: submitted
                ? "hsl(0 65% 48%)"
                : "hsl(38 72% 50%)",
              color: submitted
                ? "hsl(0 65% 60%)"
                : "hsl(38 72% 50%)",
              background: submitted ? "hsl(0 65% 48% / 0.08)" : "transparent",
            }}
          >
            {submitted ? "Incorrect — The Silencer moves closer" : "Submit Decode"}
          </button>
        </div>
      </motion.div>

      {/* Hint */}
      <p className="max-w-2xl mx-auto mt-2 text-[9px] tracking-[0.2em] text-muted-foreground/30 font-body text-right px-1 uppercase">
        Caesar cipher · shift by a number between 1–25
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
          {/* Hidden Orb 6 — camouflaged near the timeline line top */}
          <HiddenOrb id={6} className="absolute left-[14px] sm:left-[calc(50%-6px)] top-[-12px] z-20" />

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
