import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ParticleCanvas from "@/components/ParticleCanvas";
import { HiddenOrb, useGame } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import GuideWhisper from "@/components/GuideWhisper";
import { characters } from "@/data/world-data";
import { characterImageMap } from "@/data/guide-images";
import heroBg from "@/assets/pool.jpg";

// Resolve character portrait: new characters use a full path, legacy ones use a key
const resolveImage = (image: string): string =>
  image.startsWith("/") ? image : (characterImageMap[image] ?? image);

// Fixed display order for the character grid
const CHARACTER_ORDER = [
  "remsays", "quinn", "thema", "sailor",
  "kotani", "norstrand", "culver", "carmela",
  "lockland", "gemma", "verlaine", "jude",
  "aspen", "wintry", "cora", "soleil",
];

const orderedCharacters = CHARACTER_ORDER
  .map((id) => characters.find((c) => c.id === id))
  .filter(Boolean) as typeof characters;

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

// ─── The Unmasked - Game Data ──────────────────────────────────────────────────
const UNMASKED_SCROLL_ID = 9; // The Unmasked now awards Scroll 9

type QuestionDef = {
  id: string;
  answer: string;
  image: string;
  clues: [string, string, string];
};

const ALL_QUESTIONS: QuestionDef[] = [
  {
    id: "lockland", answer: "Lockland", image: "char-lockland",
    clues: [
      "This person smells of something that no longer grows on Panterra.",
      "This person chose the moment of their own ending with more care than most people choose anything.",
      "Carmela would have followed this person anywhere. They made sure that never had to happen.",
    ],
  },
  {
    id: "aspen", answer: "Aspen", image: "char-aspen",
    clues: [
      "Everyone in the room trusts this person. That should worry you.",
      "This person rose faster than the system allows. The system made an exception.",
      "This person was chosen by one and used by another. The difference may not yet be understood.",
    ],
  },
  {
    id: "verlaine", answer: "Verlaine", image: "char-verlaine",
    clues: [
      "This person arrived with a new name and a borrowed history.",
      "This person had a parent who watched from a distance and called it love.",
      "This person burnt down the one who almost remembered their real face.",
    ],
  },
  {
    id: "wintry", answer: "Wintry", image: "char-wintry",
    clues: [
      "This person built someone else's power so carefully they never noticed it was theirs.",
      "This person carries a secret about what waits after Apotheosis that has never been spoken aloud.",
      "This person chose cream. Always cream. Even when the world was ending.",
    ],
  },
  {
    id: "remsays", answer: "Remsays", image: "char-remsays",
    clues: [
      "This person was offered the highest seat and turned it down. That was not humility.",
      "This person built a machine to make a lie look like truth. They called it an algorithm.",
      "This person loves someone. That is the most dangerous thing about them.",
    ],
  },
  {
    id: "quinn", answer: "Quinnevere", image: "char-quinn",
    clues: [
      "This person reads languages that no one else in the room can understand.",
      "This person stands between two people who would destroy each other and has not yet chosen a side.",
      "This person was admired so completely that no one thought to ask what they wanted.",
    ],
  },
  {
    id: "carmela", answer: "Carmela", image: "char-carmela",
    clues: [
      "This person served faithfully for years before beginning to question what they were serving.",
      "This person was trusted with proximity to power they never sought for themselves.",
      "This person held the room together after the person who built it was gone.",
    ],
  },
  {
    id: "jude", answer: "Jude", image: "char-jude",
    clues: [
      "This person held the highest seat and grew tired of it long before they left.",
      "This person chose a successor and then quietly ensured the choice would stick.",
      "This person knew the meteor was coming and decided who would be told first.",
    ],
  },
  {
    id: "thema", answer: "Thema", image: "char-thema",
    clues: [
      "This person wears something across their face that others have stopped questioning.",
      "This person governs with amusement. That is either wisdom or something colder.",
      "This person has presided over more endings than anyone has counted.",
    ],
  },
  {
    id: "culver", answer: "Culver", image: "char-culver",
    clues: [
      "This person found something in the black sea that was not supposed to be findable.",
      "This person believes the world can be restored. Most people stopped believing that before they were born.",
      "This person's idealism is either the most useful thing about them or the most dangerous.",
    ],
  },
  {
    id: "sailor", answer: "Sailor", image: "char-sailor",
    clues: [
      "This person is liked by everyone who meets them. That is not an accident.",
      "This person operates at the edges of things - the frontier, the boundary, the almost-outside.",
      "This person knows more than they say and says more than they know.",
    ],
  },
  {
    id: "gemma", answer: "Gemma", image: "char-gemma",
    clues: [
      "This person carries a rank that was earned under circumstances no one discusses publicly.",
      "This person has a scar that marks more than just skin.",
      "This person chose the harder path every time one was available.",
    ],
  },
  {
    id: "norstrand", answer: "Nordstrand", image: "char-norstrand",
    clues: [
      "This person has presided over ceremonies they no longer fully believe in.",
      "This person kissed someone in front of the dead. They have never explained why.",
      "This person builds things meant to outlast them and is only now asking whether they should.",
    ],
  },
  {
    id: "soleil", answer: "Soleil", image: "char-soleil",
    clues: [
      "This person is far more observant than their warmth suggests.",
      "This person moves through institutions as if they were built for them.",
      "This person has access to rooms that most people do not know exist.",
    ],
  },
  {
    id: "kotani", answer: "Kotani", image: "char-kotani",
    clues: [
      "This person understood what the meteor meant before anyone else in the room.",
      "This person lost someone to a ceremony and never recovered from what that loss revealed.",
      "This person accepted the end with a calm that frightened the people standing next to them.",
    ],
  },
  {
    id: "cora", answer: "Cora", image: "char-cora",
    clues: [
      "This person sits in rooms where the future of Panterra is decided and says very little.",
      "This person loves their children completely and has made choices that contradict that love.",
      "This person knows where Valorica is. They have known for a long time.",
    ],
  },
];

const TOTAL_ROUNDS = 8;
const TOTAL_LIVES = 3;
const CHOICE_COUNT = 6;
const CLUE_COUNT = 3;

const BASE_SCORE_START = 6;
const CLUE_PENALTY = 2;
const CORRECT_BONUS = 3;

function roundScore(cluesRevealed: number): number {
  return Math.max(0, BASE_SCORE_START - (cluesRevealed - 1) * CLUE_PENALTY);
}

/** Select 8 random questions, ensuring meaningfully different from previous set */
function selectGameQuestions(prevIds: string[]): QuestionDef[] {
  const MAX_OVERLAP = 6; // at most 6 can repeat - guarantees at least 2 new
  for (let attempt = 0; attempt < 50; attempt++) {
    const shuffled = shuffle(ALL_QUESTIONS);
    const picked = shuffled.slice(0, TOTAL_ROUNDS);
    const overlap = picked.filter((q) => prevIds.includes(q.id)).length;
    if (prevIds.length === 0 || overlap <= MAX_OVERLAP) return picked;
  }
  return shuffle(ALL_QUESTIONS).slice(0, TOTAL_ROUNDS);
}

/** Build 6 choices: correct + 5 random from the full 16 pool (excluding correct) */
function buildChoices(correctId: string): string[] {
  const others = ALL_QUESTIONS.filter((q) => q.id !== correctId);
  const pool = shuffle(others).slice(0, CHOICE_COUNT - 1).map((q) => q.id);
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

  // Look up from ALL_QUESTIONS first, then fall back to characters array
  const qMatch = ALL_QUESTIONS.find((q) => q.id === charId);
  const displayName = qMatch?.answer ?? characters.find((c) => c.id === charId)?.name ?? charId;
  const imgKey = qMatch?.image ?? characters.find((c) => c.id === charId)?.image ?? "";
  const imgSrc = resolveImage(imgKey);

  return (
    <motion.button
      onClick={onSelect}
      disabled={disabled || state !== "idle"}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      className="relative aspect-[2/3] overflow-hidden border border-border hover:border-primary/60 transition-colors group focus:outline-none"
    >
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
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={state === "glitch" ? { animation: "unmasked-glitch 1s steps(1) forwards" } : {}}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
      {state === "idle" && (
        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2">
          <p className="font-display text-[9px] sm:text-[10px] tracking-wider text-foreground leading-tight truncate">
            {displayName}
          </p>
        </div>
      )}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/40 transition-colors pointer-events-none" />
    </motion.button>
  );
};

// ─── The Unmasked Game ─────────────────────────────────────────────────────────
type GamePhase = "playing" | "wrong" | "round-summary" | "won" | "lost";

const getWinRank = (score: number): string => {
  if (score >= 40) return "The Unmasked cannot deceive you. You see everything.";
  if (score >= 25) return "You see more than most. That is enough to survive.";
  return "You found them. But it cost you. Be more careful next time.";
};

const TheUnmasked = () => {
  const { foundScrolls, awardScroll } = useGame();
  const alreadyWon = foundScrolls.includes(UNMASKED_SCROLL_ID);
  const [bestiaryUnlocked, setBestiaryUnlocked] = useState(alreadyWon);

  // Game questions state
  const [gameQuestions, setGameQuestions] = useState<QuestionDef[]>(() => selectGameQuestions([]));
  const [prevIds, setPrevIds] = useState<string[]>([]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [cluesRevealed, setCluesRevealed] = useState(1);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [glitchingId, setGlitchingId] = useState<string | null>(null);
  const [wrongMessage, setWrongMessage] = useState(false);
  const [lastRoundPts, setLastRoundPts] = useState(0);

  // Shuffled clues for current round - re-shuffled each time roundIdx changes
  const [shuffledClues, setShuffledClues] = useState<string[]>(() =>
    shuffle([...gameQuestions[0].clues])
  );

  // Whenever roundIdx changes, shuffle clues for that round
  useEffect(() => {
    const q = gameQuestions[roundIdx];
    if (q) setShuffledClues(shuffle([...q.clues]));
  }, [roundIdx, gameQuestions]);

  const currentRound = gameQuestions[roundIdx];

  // Choices for current round
  const choices = useMemo(
    () => buildChoices(currentRound?.id ?? ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roundIdx, gameQuestions]
  );

  const availableClueScore = roundScore(cluesRevealed);

  const resetRound = useCallback(() => {
    setCluesRevealed(1);
    setGlitchingId(null);
    setWrongMessage(false);
    setPhase("playing");
  }, []);

  const fullReset = useCallback(() => {
    const currentIds = gameQuestions.map((q) => q.id);
    const newQuestions = selectGameQuestions(currentIds);
    setPrevIds(currentIds);
    setGameQuestions(newQuestions);
    setRoundIdx(0);
    setLives(TOTAL_LIVES);
    setScore(0);
    setCluesRevealed(1);
    setGlitchingId(null);
    setWrongMessage(false);
    setLastRoundPts(0);
    setPhase("playing");
  }, [gameQuestions]);

  const revealNextClue = () => {
    if (cluesRevealed < CLUE_COUNT) setCluesRevealed((n) => n + 1);
  };

  const handleGuess = useCallback(
    (guessId: string) => {
      if (phase !== "playing" || !currentRound) return;

      if (guessId === currentRound.id) {
        const pts = roundScore(cluesRevealed) + CORRECT_BONUS;
        const newScore = score + pts;
        setScore(newScore);
        setLastRoundPts(pts);

        if (roundIdx + 1 >= TOTAL_ROUNDS) {
          setPhase("won");
          setBestiaryUnlocked(true);
          if (!alreadyWon) awardScroll(UNMASKED_SCROLL_ID);
          localStorage.setItem('unmasked-won', 'true');
        } else {
          setPhase("round-summary");
          setTimeout(() => {
            setRoundIdx((r) => r + 1);
            setCluesRevealed(1);
            setGlitchingId(null);
            setPhase("playing");
          }, 2200);
        }
      } else {
        const newLives = lives - 1;
        setLives(newLives);
        setPhase("wrong");
        setGlitchingId(guessId);
        setWrongMessage(false);

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
    [phase, currentRound, cluesRevealed, score, roundIdx, lives, alreadyWon, awardScroll, resetRound]
  );

  return (
    <section className="py-16 sm:py-20 px-4">
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
              className="absolute inset-0 bg-background/93 flex flex-col items-center justify-center z-30 gap-4 p-8 text-center"
            >
              <p className="font-display text-xs tracking-[0.25em] text-primary uppercase">All Masks Seen Through</p>
              <p className="font-narrative italic text-foreground/70 text-[0.9375rem] leading-[1.8] max-w-sm">
                You saw through every mask. In Panterra, that is a rare and dangerous gift. A scroll fragment has been added to your collection.
              </p>
              <div className="flex flex-col items-center gap-1">
                <p className="font-display text-2xl tracking-widest" style={{ color: "hsl(38 72% 55%)" }}>
                  {score} pts
                </p>
                <p className="font-narrative italic text-foreground/50 text-[0.8125rem] leading-[1.7] max-w-xs">
                  {getWinRank(score)}
                </p>
              </div>
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
                onClick={fullReset}
                className="px-8 py-2.5 border border-border text-muted-foreground font-body text-[10px] tracking-widest uppercase hover:border-primary/40 hover:text-primary transition-colors"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Round summary overlay ── */}
        <AnimatePresence>
          {phase === "round-summary" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/92 flex flex-col items-center justify-center z-20 gap-3 p-8 text-center"
            >
              <p className="font-display text-[10px] tracking-[0.3em] text-primary uppercase">Identity Confirmed</p>
              <p className="font-narrative italic text-foreground/60 text-[0.875rem]">
                Round {roundIdx + 1} complete
              </p>
              <p className="font-display text-3xl tracking-widest" style={{ color: "hsl(38 72% 55%)" }}>
                +{lastRoundPts} pts
              </p>
              <p className="text-[9px] tracking-[0.2em] text-muted-foreground/40 uppercase font-body">
                Running total: {score} pts
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Playing / Wrong ── */}
        {(phase === "playing" || phase === "wrong") && currentRound && (
          <div className="p-5 sm:p-6 flex flex-col gap-5">

            {/* Header row: round + lives + live score */}
            <div className="flex items-center justify-between">
              <p className="text-[9px] tracking-[0.3em] text-muted-foreground/50 uppercase font-body">
                Round {roundIdx + 1} of {TOTAL_ROUNDS}
              </p>

              {/* Lives - brass orbs */}
              <div className="flex gap-2 items-center">
                <p className="text-[8px] tracking-[0.2em] text-muted-foreground/40 uppercase font-body mr-1">Lives</p>
                {Array.from({ length: TOTAL_LIVES }).map((_, i) => {
                  const livesRemaining = lives;
                  const isActive = i < livesRemaining;
                  const orbColor = livesRemaining === 1 ? "#8b1a1a" : livesRemaining === 2 ? "#c97820" : "#d4a843";
                  return (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border transition-all duration-500"
                    style={{
                      background: isActive ? orbColor : "transparent",
                      borderColor: isActive ? orbColor : "hsl(38 20% 25%)",
                      boxShadow: isActive ? `0 0 8px ${orbColor}99` : "none",
                    }}
                  />
                  );
                })}
              </div>

              {/* Live running total */}
              <div className="flex flex-col items-end">
                <p className="text-[9px] tracking-[0.2em] font-body" style={{ color: "hsl(38 60% 50%)" }}>
                  {score} pts total
                </p>
                <p className="text-[8px] tracking-[0.15em] font-body text-muted-foreground/40">
                  +{availableClueScore + CORRECT_BONUS} if correct
                </p>
              </div>
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

              {/* Clues - shown in shuffled order */}
              <div className="flex-1 flex flex-col gap-2.5">
                <p className="text-[8px] tracking-[0.3em] text-muted-foreground/40 uppercase font-body">
                  Evidence - {cluesRevealed} of {CLUE_COUNT} revealed
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
                        "{shuffledClues[i]}"
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
                    ◈ Reveal next clue (−{CLUE_PENALTY}pts)
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
                  style={{ color: "#8b1a1a" }}
                >
                  That is not who you are looking for. Look closer.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Choice grid: 3×2 */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
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
              Clue 1 = 6pts · Clue 2 = 4pts · Clue 3 = 2pts · +3 bonus on correct · wrong = −1 life
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
          <div className="flex-shrink-0 w-12 h-14 border border-border flex items-end justify-center pb-1 overflow-hidden">
            {bestiaryUnlocked || alreadyWon ? (
              <svg width="22" height="40" viewBox="0 0 22 40" fill="none">
                <ellipse cx="11" cy="8" rx="8" ry="7" fill="hsl(38 20% 22%)" />
                <ellipse cx="11" cy="10" rx="6" ry="5.5" fill="hsl(38 20% 14%)" opacity="0.7" />
                <path d="M4 16 Q2 30 2 40 L7 40 L8 28 L11 30 L14 28 L15 40 L20 40 Q20 30 18 16 Z" fill="hsl(38 20% 12%)" />
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
                The semper scar is Panterra's only proof of identity. It can be replicated. Sanctorium has known this since the third year of the New Republic. The record of that discovery was sealed the same afternoon.
              </p>
              {!(bestiaryUnlocked || alreadyWon) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase font-body">
                    See through all eight masks to unlock
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

  const rows = chunk(orderedCharacters, cols);
  const selectedIndex = orderedCharacters.findIndex((c) => c.id === selected);
  const selectedRow = selectedIndex >= 0 ? Math.floor(selectedIndex / cols) : -1;
  const selectedColInRow = selectedIndex >= 0 ? selectedIndex % cols : 0;

  // Caret horizontal offset: center of the selected card's column
  const caretLeft = `calc(${selectedColInRow} * (100% / ${cols}) + (100% / ${cols} / 2) - 10px)`;

  return (
    <Layout>
      {/* Hero */}
      <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <img src={heroBg} alt="Characters" className="w-full h-full object-cover" style={{ objectPosition: "center top" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 via-60% to-background" />
        <ParticleCanvas density={0.5} />
      </div>

      <div className="pb-20 px-4 overflow-x-hidden">
        <div className="relative">
          <SectionHeader
            title="Character Database"
            subtitle="The key figures whose choices will shape the fate of Panterra"
          />
          <HiddenOrb id={4} className="absolute top-2 right-4 sm:right-12" />
        </div>

        <div className="max-w-6xl mx-auto mt-4 mb-10">
          <GuideWhisper page="characters" />
        </div>

        {/* Outer grid ref - used only for width measurement */}
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
                            {char.name}
                          </p>
                          <p className="text-[8px] sm:text-[10px] tracking-wider text-primary uppercase font-body mt-0.5">
                            {char.title}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Inline detail panel - spliced below matching row */}
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
                      {/* Caret - outer (border color) */}
                      <div
                        className="absolute -top-3 z-10 h-0 w-0 pointer-events-none"
                        style={{
                          left: caretLeft,
                          borderLeft: "10px solid transparent",
                          borderRight: "10px solid transparent",
                          borderBottom: "10px solid hsl(var(--border))",
                        }}
                      />
                      {/* Caret - inner (card bg color) */}
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
                              <h3 className="font-display text-[1.625rem] sm:text-2xl tracking-wide text-foreground">
                                {selectedChar.name}
                              </h3>
                              <p className="text-[10px] tracking-[0.3em] text-primary uppercase font-body mt-1">
                                {selectedChar.title}
                              </p>
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="font-narrative text-[1.0625rem] sm:text-lg text-foreground/70 italic leading-[1.8] mt-1"
                              >
                                {selectedChar.position}
                              </motion.p>
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

        {/* The Unmasked - identity mini-game */}
        <TheUnmasked />
      </div>
    </Layout>
  );
};

export default Characters;
