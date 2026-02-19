import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { HiddenOrb, useGame } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import { characters } from "@/data/world-data";
import { characterImageMap } from "@/data/guide-images";

// Resolve character portrait: new characters use a full path, legacy ones use a key
const resolveImage = (image: string): string =>
  image.startsWith("/") ? image : (characterImageMap[image] ?? image);

// Group an array into chunks of `size`
function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

// Detect column count by measuring the grid container's width
function getColCount(width: number): number {
  if (width < 640) return 2;
  return 4;
}

// ─── Fisher-Yates shuffle ─────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── The Unmasked — Game Data ──────────────────────────────────────────────────
const UNMASKED_SCROLL_ID = 4;

type RoundDef = {
  answerId: string;
  clues: [string, string, string];
};

const ROUNDS: RoundDef[] = [
  {
    answerId: "lockland",
    clues: [
      "He smells of something that no longer grows on Panterra.",
      "He chose the moment of his own ending with more care than most people choose anything.",
      "Carmela would have followed him anywhere. He made sure she didn't have to.",
    ],
  },
  {
    answerId: "aspen",
    clues: [
      "Everyone in the room trusts him. That should worry you.",
      "He rose faster than the system allows. The system made an exception.",
      "He was chosen by one man and used by another. He may not know the difference yet.",
    ],
  },
  {
    answerId: "verlaine",
    clues: [
      "She arrived with a new name and a borrowed history.",
      "She had a mother who watched from a distance and called it love.",
      "She burnt down the one person who almost remembered her real face.",
    ],
  },
  {
    answerId: "wintry",
    clues: [
      "She built someone else's power so carefully they never noticed it was hers.",
      "She carries a secret about what waits after Apotheosis that she has told no one.",
      "She chose cream. Always cream. Even when the world was ending.",
    ],
  },
  {
    answerId: "remsays",
    clues: [
      "He was offered the highest seat and turned it down. That was not humility.",
      "He built a machine to make a lie look like truth. He called it an algorithm.",
      "He loves her. That is the most dangerous thing about him.",
    ],
  },
];

const TOTAL_ROUNDS = ROUNDS.length;
const TOTAL_LIVES = 3;
const CHOICE_COUNT = 6;
const CLUE_COUNT = 3;

// Points per clue tier (clue revealed count when guess is made)
const POINTS_BY_CLUE = [3, 2, 1];

// Build choice pool: correct + 5 random others from character list
function buildChoices(correctId: string): string[] {
  const others = characters.filter((c) => c.id !== correctId);
  const pool = shuffle(others).slice(0, CHOICE_COUNT - 1).map((c) => c.id);
  return shuffle([correctId, ...pool]);
}

// ─── Glitch animation style ────────────────────────────────────────────────────
const glitchKeyframes = `
@keyframes unmasked-glitch {
  0%   { filter: saturate(0) hue-rotate(0deg) brightness(1);   transform: translate(0,0) skewX(0deg); }
  10%  { filter: saturate(0) hue-rotate(90deg) brightness(1.4); transform: translate(-3px,1px) skewX(4deg); }
  20%  { filter: saturate(0) hue-rotate(180deg) brightness(0.7); transform: translate(3px,-2px) skewX(-4deg); }
  35%  { filter: saturate(0) hue-rotate(270deg) brightness(1.2); transform: translate(-2px,2px) skewX(2deg); }
  50%  { filter: saturate(0) hue-rotate(360deg) brightness(0.9); transform: translate(2px,-1px) skewX(-2deg); }
  70%  { filter: saturate(0) brightness(1.3); transform: translate(-1px,1px) skewX(1deg); }
  100% { filter: saturate(0) brightness(1); transform: translate(0,0) skewX(0deg); }
}
`;

// ─── ChoiceCard component ──────────────────────────────────────────────────────
type ChoiceState = "idle" | "glitch" | "silhouette";

const ChoiceCard = ({
  charId,
  onSelect,
  disabled,
  glitching,
}: {
  charId: string;
  onSelect: () => void;
  disabled: boolean;
  glitching: boolean;
}) => {
  const [state, setState] = useState<ChoiceState>("idle");

  useEffect(() => {
    if (!glitching) { setState("idle"); return; }
    setState("glitch");
    const t1 = setTimeout(() => setState("silhouette"), 1000);
    return () => clearTimeout(t1);
  }, [glitching]);

  const char = characters.find((c) => c.id === charId);
  if (!char) return null;
  const imgSrc = resolveImage(char.image);

  return (
    <motion.button
      onClick={onSelect}
      disabled={disabled || state !== "idle"}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      className="relative aspect-[2/3] overflow-hidden border border-border hover:border-primary/60 transition-colors group focus:outline-none"
      style={{ borderColor: !disabled && state === "idle" ? undefined : undefined }}
    >
      {/* Portrait / silhouette */}
      {state === "silhouette" ? (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <svg viewBox="0 0 60 90" className="w-1/2 h-auto opacity-30" fill="currentColor">
            <ellipse cx="30" cy="20" rx="14" ry="16" />
            <path d="M10 90 Q10 55 30 52 Q50 55 50 90 Z" />
          </svg>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={char.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={
            state === "glitch"
              ? { animation: "unmasked-glitch 1s steps(1) forwards" }
              : {}
          }
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
      {/* Name label */}
      {state === "idle" && (
        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2">
          <p className="font-display text-[9px] sm:text-[10px] tracking-wider text-foreground leading-tight truncate">
            {char.name.split(" ")[0]}
          </p>
        </div>
      )}
      {/* Hover brass border glow */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/40 transition-colors pointer-events-none" />
    </motion.button>
  );
};

// ─── The Unmasked Game ─────────────────────────────────────────────────────────
type GamePhase = "playing" | "wrong" | "won" | "lost";

const TheUnmasked = () => {
  const { foundScrolls, awardScrollFour } = useGame();
  const alreadyWon = foundScrolls.includes(UNMASKED_SCROLL_ID);
  const [bestiaryUnlocked, setBestiaryUnlocked] = useState(alreadyWon);

  const [roundIdx, setRoundIdx] = useState(0);
  const [cluesRevealed, setCluesRevealed] = useState(1); // start with clue 1 visible
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [glitchingId, setGlitchingId] = useState<string | null>(null);
  const [wrongMessage, setWrongMessage] = useState(false);

  // Choices for current round — rebuild when round changes
  const choices = useMemo(
    () => buildChoices(ROUNDS[roundIdx]?.answerId ?? ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roundIdx]
  );

  const currentRound = ROUNDS[roundIdx];

  const resetRound = useCallback(() => {
    setCluesRevealed(1);
    setGlitchingId(null);
    setWrongMessage(false);
    setPhase("playing");
  }, []);

  const fullReset = useCallback(() => {
    setRoundIdx(0);
    setLives(TOTAL_LIVES);
    setScore(0);
    setCluesRevealed(1);
    setGlitchingId(null);
    setWrongMessage(false);
    setPhase("playing");
  }, []);

  const handleGuess = useCallback(
    (guessId: string) => {
      if (phase !== "playing" || !currentRound) return;

      if (guessId === currentRound.answerId) {
        // Correct
        const pts = POINTS_BY_CLUE[cluesRevealed - 1] ?? 1;
        const newScore = score + pts;
        setScore(newScore);

        if (roundIdx + 1 >= TOTAL_ROUNDS) {
          // Final round won
          setPhase("won");
          setBestiaryUnlocked(true);
          if (!alreadyWon) awardScrollFour();
        } else {
          setRoundIdx((r) => r + 1);
          setCluesRevealed(1);
          setGlitchingId(null);
          setPhase("playing");
        }
      } else {
        // Wrong
        const newLives = lives - 1;
        setLives(newLives);
        setPhase("wrong");
        setGlitchingId(guessId);
        setWrongMessage(false);

        // After glitch (1s) show silhouette + message, then after 2s more: restart or game over
        setTimeout(() => {
          setWrongMessage(true);
          setTimeout(() => {
            if (newLives <= 0) {
              setPhase("lost");
            } else {
              resetRound();
            }
          }, 2000);
        }, 1000);
      }
    },
    [phase, currentRound, cluesRevealed, score, roundIdx, lives, alreadyWon, awardScrollFour, resetRound]
  );

  const revealNextClue = () => {
    if (cluesRevealed < CLUE_COUNT) setCluesRevealed((n) => n + 1);
  };

  // ── Render ──
  return (
    <section className="py-16 sm:py-20 px-4">
      {/* Inject glitch keyframes */}
      <style>{glitchKeyframes}</style>

      {/* Steampunk divider */}
      <div className="max-w-2xl mx-auto mb-12 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="flex items-center gap-2 px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary/60">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" />
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
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
          className="font-display text-2xl sm:text-3xl tracking-[0.12em]"
          style={{ color: "hsl(38 72% 55%)" }}
        >
          The Unmasked
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-3 font-narrative italic text-muted-foreground text-[0.9375rem] leading-[1.8]"
        >
          Someone in Panterra is not who they claim to be. They never were. Can you see through the mask before it sees through you?
        </motion.p>
      </div>

      {/* Game Container */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto bg-card border border-border relative overflow-hidden"
        style={{ minHeight: 400 }}
      >
        {/* ── Lost screen ── */}
        <AnimatePresence>
          {phase === "lost" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/96 flex flex-col items-center justify-center z-30 gap-6 p-8 text-center"
            >
              <p className="font-display text-xs tracking-[0.25em] text-destructive uppercase">Identity Compromised</p>
              <p className="font-narrative italic text-foreground/70 text-[0.9375rem] leading-[1.8] max-w-sm">
                The Unmasked has worn every face in this room. You can no longer trust what you see.
              </p>
              <button
                onClick={fullReset}
                className="px-8 py-2.5 border font-body text-[10px] tracking-widest uppercase hover:bg-primary/10 transition-colors"
                style={{ borderColor: "hsl(38 72% 50%)", color: "hsl(38 72% 55%)" }}
              >
                Begin Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Won screen ── */}
        <AnimatePresence>
          {phase === "won" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/93 flex flex-col items-center justify-center z-30 gap-5 p-8 text-center"
            >
              <p className="font-display text-xs tracking-[0.25em] text-primary uppercase">All Masks Seen Through</p>
              <p className="font-narrative italic text-foreground/70 text-[0.9375rem] leading-[1.8] max-w-sm">
                You saw through every mask. In Panterra, that is a rare and dangerous gift. A scroll fragment has been added to your collection.
              </p>
              <p className="font-display text-sm tracking-widest" style={{ color: "hsl(38 72% 55%)" }}>
                {score} points
              </p>
              <div className="w-8 h-px bg-primary/40" />
              <button
                onClick={fullReset}
                className="px-8 py-2.5 border border-border text-muted-foreground font-body text-[10px] tracking-widest uppercase hover:border-primary/40 hover:text-primary transition-colors"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Playing / Wrong ── */}
        {(phase === "playing" || phase === "wrong") && currentRound && (
          <div className="p-5 sm:p-6 flex flex-col gap-5">

            {/* Header row: round + lives + score */}
            <div className="flex items-center justify-between">
              <p className="text-[9px] tracking-[0.3em] text-muted-foreground/50 uppercase font-body">
                Round {roundIdx + 1} of {TOTAL_ROUNDS}
              </p>

              {/* Lives — brass orbs */}
              <div className="flex gap-2 items-center">
                <p className="text-[8px] tracking-[0.2em] text-muted-foreground/40 uppercase font-body mr-1">Lives</p>
                {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border transition-all duration-500"
                    style={{
                      background: i < lives ? "hsl(38 72% 50%)" : "transparent",
                      borderColor: i < lives ? "hsl(38 72% 50%)" : "hsl(38 20% 25%)",
                      boxShadow: i < lives ? "0 0 6px hsl(38 72% 50% / 0.6)" : "none",
                    }}
                  />
                ))}
              </div>

              <p className="text-[9px] tracking-[0.2em] font-body" style={{ color: "hsl(38 60% 50%)" }}>
                {score} pts
              </p>
            </div>

            {/* Face-down card + clues */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Face-down portrait */}
              <div
                className="flex-shrink-0 w-full sm:w-32 mx-auto sm:mx-0 max-w-[120px] aspect-[2/3] border border-border bg-background/60 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <svg viewBox="0 0 40 60" className="w-10" fill="currentColor">
                    <ellipse cx="20" cy="13" rx="10" ry="11" />
                    <path d="M6 60 Q6 36 20 34 Q34 36 34 60 Z" />
                  </svg>
                  <span className="text-[8px] tracking-widest uppercase font-body">Unknown</span>
                </div>
              </div>

              {/* Clues */}
              <div className="flex-1 flex flex-col gap-2.5">
                <p className="text-[8px] tracking-[0.3em] text-muted-foreground/40 uppercase font-body">
                  Evidence — {cluesRevealed} of {CLUE_COUNT} revealed
                </p>
                {Array.from({ length: cluesRevealed }).map((_, i) => (
                  <AnimatePresence key={i}>
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="border-l-2 pl-3 py-1"
                      style={{ borderColor: "hsl(38 72% 50% / 0.5)" }}
                    >
                      <p className="font-narrative italic text-foreground/80 text-[0.875rem] leading-[1.7]">
                        "{currentRound.clues[i]}"
                      </p>
                    </motion.div>
                  </AnimatePresence>
                ))}

                {/* Reveal next clue */}
                {cluesRevealed < CLUE_COUNT && phase === "playing" && (
                  <button
                    onClick={revealNextClue}
                    className="self-start mt-1 text-[8px] tracking-[0.25em] uppercase font-body border border-border/40 px-3 py-1.5 hover:border-primary/40 hover:text-primary transition-colors text-muted-foreground/50"
                  >
                    ◈ Reveal next clue {cluesRevealed < 2 ? `(-${POINTS_BY_CLUE[cluesRevealed]}pts)` : "(−1pt)"}
                  </button>
                )}
              </div>
            </div>

            {/* Wrong guess message */}
            <AnimatePresence>
              {wrongMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center font-narrative italic text-[0.875rem] leading-[1.7]"
                  style={{ color: "hsl(0 60% 55%)" }}
                >
                  That is not who you are looking for. Look closer.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Choice grid: 3×2 on mobile, 3×2 on desktop (6 portraits) */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
              {choices.map((charId) => (
                <ChoiceCard
                  key={`${roundIdx}-${charId}`}
                  charId={charId}
                  onSelect={() => handleGuess(charId)}
                  disabled={phase === "wrong"}
                  glitching={glitchingId === charId}
                />
              ))}
            </div>

            {/* Points legend */}
            <p className="text-[8px] tracking-[0.2em] text-muted-foreground/30 uppercase font-body text-center">
              Correct on clue 1 = 3pts · clue 2 = 2pts · clue 3 = 1pt · wrong = −1 life
            </p>
          </div>
        )}
      </motion.div>

      {/* ── Bestiary Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto mt-10 border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          {/* Unmasked silhouette icon */}
          <div className="flex-shrink-0 w-12 h-14 border border-border flex items-end justify-center pb-1 overflow-hidden">
            {bestiaryUnlocked || alreadyWon ? (
              <svg width="22" height="40" viewBox="0 0 22 40" fill="none">
                {/* Two layered faces */}
                <ellipse cx="11" cy="8" rx="8" ry="7" fill="hsl(38 20% 22%)" />
                <ellipse cx="11" cy="10" rx="6" ry="5.5" fill="hsl(38 20% 14%)" opacity="0.7" />
                <path d="M4 16 Q2 30 2 40 L7 40 L8 28 L11 30 L14 28 L15 40 L20 40 Q20 30 18 16 Z" fill="hsl(38 20% 12%)" />
                {/* Mask overlay */}
                <path d="M5 6 Q11 0 17 6 L16 12 Q11 16 6 12 Z" fill="hsl(38 20% 18%)" opacity="0.6" />
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
              Bestiary · Identity Entity
            </p>
            <h3 className="font-display text-base tracking-wide text-foreground">
              The Unmasked
            </h3>
            <div className="mt-3 relative">
              <p
                className="font-narrative text-[0.875rem] text-foreground/70 leading-[1.8] transition-all duration-700"
                style={{
                  filter: bestiaryUnlocked || alreadyWon ? "none" : "blur(4px)",
                  userSelect: bestiaryUnlocked || alreadyWon ? "text" : "none",
                }}
              >
                The semper scar is Panterra's only proof of identity. It can be replicated. The Sanctorium has known this since the third year of the New Republic. The record of that discovery was sealed the same afternoon.
              </p>
              {!(bestiaryUnlocked || alreadyWon) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase font-body">
                    See through all five masks to unlock
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

// ─── Main Characters Page ──────────────────────────────────────────────────────
const Characters = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [cols, setCols] = useState(5);
  const selectedChar = characters.find((c) => c.id === selected);
  const gridRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Measure grid width to determine column count
  const measureCols = useCallback(() => {
    if (gridRef.current) {
      setCols(getColCount(gridRef.current.offsetWidth));
    }
  }, []);

  useEffect(() => {
    measureCols();
    const ro = new ResizeObserver(measureCols);
    if (gridRef.current) ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [measureCols]);

  // Scroll the panel into view smoothly when selection changes
  useEffect(() => {
    if (selected && panelRef.current) {
      const timer = setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selected]);

  const rows = chunk(characters, cols);
  const selectedIndex = characters.findIndex((c) => c.id === selected);
  const selectedRow = selectedIndex >= 0 ? Math.floor(selectedIndex / cols) : -1;
  const selectedColInRow = selectedIndex >= 0 ? selectedIndex % cols : 0;

  // Caret horizontal offset: center of the selected card's column
  const caretLeft = `calc(${selectedColInRow} * (100% / ${cols}) + (100% / ${cols} / 2) - 10px)`;

  return (
    <Layout>
      <div className="pt-24 pb-20 px-4 overflow-x-hidden">
        <div className="relative">
          <SectionHeader
            title="Character Database"
            subtitle="The key figures whose choices will shape the fate of Panterra"
          />
          <HiddenOrb id={4} className="absolute top-2 right-4 sm:right-12" />
        </div>

        {/* Outer grid ref — used only for width measurement */}
        <div ref={gridRef} className="max-w-6xl mx-auto">
          {rows.map((row, rowIdx) => {
            const isSelectedRow = rowIdx === selectedRow;
            return (
              <div key={rowIdx} className="mb-4">
                {/* Row of cards */}
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {row.map((char, colIdx) => {
                    const globalIdx = rowIdx * cols + colIdx;
                    return (
                      <motion.button
                        key={char.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: globalIdx * 0.07 }}
                        onClick={() => setSelected(char.id === selected ? null : char.id)}
                        className={`relative group overflow-hidden aspect-[2/3] border transition-all ${
                          selected === char.id
                            ? "border-primary shadow-glow"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <img
                          src={resolveImage(char.image)}
                          alt={char.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="font-display text-[10px] sm:text-xs tracking-wider text-foreground leading-tight">
                            {char.name.split(" ")[0]}
                          </p>
                          <p className="text-[8px] sm:text-[10px] tracking-wider text-primary uppercase font-body mt-0.5">
                            {char.magistry ?? char.faction}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Inline detail panel — spliced below matching row */}
                <AnimatePresence>
                  {isSelectedRow && selectedChar && (
                    <motion.div
                      ref={panelRef}
                      key={`panel-${selected}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="relative mt-3"
                    >
                      {/* Caret — outer (border color) */}
                      <div
                        className="absolute -top-3 z-10 h-0 w-0 pointer-events-none"
                        style={{
                          left: caretLeft,
                          borderLeft: "10px solid transparent",
                          borderRight: "10px solid transparent",
                          borderBottom: "10px solid hsl(var(--border))",
                        }}
                      />
                      {/* Caret — inner (card bg color) */}
                      <div
                        className="absolute -top-[10px] z-20 h-0 w-0 pointer-events-none"
                        style={{
                          left: `calc(${selectedColInRow} * (100% / ${cols}) + (100% / ${cols} / 2) - 9px)`,
                          borderLeft: "9px solid transparent",
                          borderRight: "9px solid transparent",
                          borderBottom: "9px solid hsl(var(--card))",
                        }}
                      />

                      <div className="bg-card border border-border p-5 sm:p-8">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Portrait */}
                          <div className="w-full sm:w-44 mx-auto sm:mx-0 sm:flex-shrink-0 max-w-[160px]">
                            <img
                              src={resolveImage(selectedChar.image)}
                              alt={selectedChar.name}
                              className="w-full aspect-[2/3] object-cover border border-border"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-4">
                            <div>
                              <p className="text-[10px] tracking-[0.3em] text-primary uppercase font-body">
                                {selectedChar.magistry ?? selectedChar.faction}
                              </p>
                              <h3 className="font-display text-[1.625rem] sm:text-2xl tracking-wide text-foreground mt-1">
                                {selectedChar.name}
                              </h3>
                              <p className="font-narrative text-[1.0625rem] sm:text-lg text-foreground/70 italic leading-[1.8]">
                                {selectedChar.title}
                              </p>
                            </div>

                            <div className="steampunk-divider" />

                            {selectedChar.philosophy && (
                              <div>
                                <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                                  Philosophy
                                </h4>
                                <p className="text-[0.9375rem] sm:text-sm text-foreground/80 font-narrative italic leading-[1.8]">
                                  "{selectedChar.philosophy}"
                                </p>
                              </div>
                            )}

                            {selectedChar.description && (
                              <div>
                                <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                                  About
                                </h4>
                                <p className="text-[0.9375rem] sm:text-sm text-foreground/80 font-narrative leading-[1.8]">
                                  {selectedChar.description}
                                </p>
                              </div>
                            )}

                            {selectedChar.alignment && (
                              <div>
                                <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                                  Alignment
                                </h4>
                                <p className="text-[0.9375rem] sm:text-sm text-foreground/80 font-body leading-[1.8]">
                                  {selectedChar.alignment}
                                </p>
                              </div>
                            )}

                            {selectedChar.personality && selectedChar.personality.length > 0 && (
                              <div>
                                <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                                  Personality
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedChar.personality.map((trait) => (
                                    <span
                                      key={trait}
                                      className="text-[10px] tracking-wider bg-secondary text-foreground/70 px-2 py-1 font-body"
                                    >
                                      {trait}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedChar.tags && selectedChar.tags.length > 0 && !selectedChar.personality && (
                              <div>
                                <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                                  Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedChar.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[10px] tracking-wider bg-secondary text-foreground/70 px-2 py-1 font-body"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedChar.background && (
                              <div>
                                <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                                  Background
                                </h4>
                                <p className="text-[0.9375rem] sm:text-sm text-foreground/70 font-narrative leading-[1.8]">
                                  {selectedChar.background}
                                </p>
                              </div>
                            )}

                            {selectedChar.relationships && (
                              <div>
                                <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                                  Relationships
                                </h4>
                                <p className="text-[0.9375rem] sm:text-sm text-foreground/70 font-narrative leading-[1.8] italic">
                                  {selectedChar.relationships}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* The Unmasked — identity mini-game */}
        <TheUnmasked />
      </div>
    </Layout>
  );
};

export default Characters;
