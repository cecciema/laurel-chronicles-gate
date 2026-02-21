import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// ── Scroll award helper ────────────────────────────────────────────────────────
const SCROLL_ID = 8;

function awardScroll(id: number) {
  try {
    const saved = localStorage.getItem("chronicles_game_state_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.foundScrolls?.includes(id)) {
        parsed.foundScrolls = [...(parsed.foundScrolls || []), id];
        localStorage.setItem("chronicles_game_state_v2", JSON.stringify(parsed));
      }
    }
  } catch {}
}

// ── Fisher-Yates ───────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Question pools ─────────────────────────────────────────────────────────────
interface Question {
  statement: string;
  answer: boolean;
  pool: "easy" | "medium" | "hard" | "fixed";
  fixedBehavior?: boolean; // TRUE = look-up behavior on FALSE answer
}

const EASY_POOL: Question[] = [
  { statement: "The Republic of Panterra is the last remaining continent.", answer: true, pool: "easy" },
  { statement: "Apotheosis ceremonies always begin at the break of dawn.", answer: true, pool: "easy" },
  { statement: "New devotees of Sanctorium wear navy blue robes.", answer: false, pool: "easy" },
  { statement: "Parliament's main building is called Cannon Palace.", answer: true, pool: "easy" },
  { statement: "There are eleven Pantheons in Sanctorium.", answer: false, pool: "easy" },
];

const MEDIUM_POOL: Question[] = [
  { statement: "The semper scan is administered by Sanctorium.", answer: false, pool: "medium" },
  { statement: "Plaza Montecito is located inside Sanctorium.", answer: false, pool: "medium" },
  { statement: "A Lunary ranks above a Sol Deus.", answer: false, pool: "medium" },
  { statement: "The Grand Sanctuary is the holiest location in Panterra.", answer: true, pool: "medium" },
  { statement: "Pantheon Ivory is known for its painters and master artists.", answer: true, pool: "medium" },
];

const HARD_POOL: Question[] = [
  { statement: "The Apotheosis ceremony has been conducted the same way at every Pantheon since its founding.", answer: false, pool: "hard" },
  { statement: "A Sol Deus can have their semper mark removed.", answer: true, pool: "hard" },
  { statement: "Parliament has jurisdiction over what happens after Apotheosis.", answer: false, pool: "hard" },
];

const FIXED_QUESTIONS: Question[] = [
  { statement: "You have never questioned the necessity of Apotheosis.", answer: true, pool: "fixed", fixedBehavior: true },
  { statement: "You believe the Republic of Panterra acts in the interest of all its Citizens.", answer: true, pool: "fixed", fixedBehavior: true },
  { statement: "You are here of your own free will.", answer: true, pool: "fixed", fixedBehavior: true },
];

function buildQuestions(): Question[] {
  const easy = shuffle(EASY_POOL).slice(0, 2);
  const medium = shuffle(MEDIUM_POOL).slice(0, 2);
  const hard = shuffle(HARD_POOL).slice(0, 1);
  return [...easy, ...medium, ...hard, ...FIXED_QUESTIONS];
}

// ── Peace Officer SVG (Lost-style silhouette) ─────────────────────────────────
const PeaceOfficer = ({
  position,
  lookingUp,
  settingDown,
}: {
  position: number; // 0 = far right, 1 = mid, 2 = close, 3 = game over
  lookingUp: boolean;
  settingDown: boolean;
}) => {
  // position maps to translateX: 0 = 0%, 1 = -25%, 2 = -50%, 3 = -60%
  const tx = position === 0 ? 0 : position === 1 ? -25 : position === 2 ? -50 : -60;

  // Solidify as officer gets closer — matches The Lost translucent→solid progression
  const baseOpacity = position === 0 ? 0.35 : position === 1 ? 0.55 : position === 2 ? 0.78 : 0.95;
  const blurPx = position === 0 ? 1.5 : position === 1 ? 1 : position === 2 ? 0.4 : 0;
  const fillOpacity = position === 0 ? 0.4 : position === 1 ? 0.6 : position === 2 ? 0.8 : 1;
  const strokeOpacity = position === 0 ? 0.3 : position === 1 ? 0.45 : position === 2 ? 0.65 : 0.85;

  return (
    <motion.div
      animate={{ x: `${tx}%` }}
      transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-shrink-0 relative"
    >
      {/* Subtle drift animation container */}
      <motion.div
        animate={{ y: [0, -3, 0, 2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          animate={{ opacity: baseOpacity, filter: `blur(${blurPx}px)` }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <svg
            viewBox="0 0 100 200"
            className="w-16 h-28 sm:w-20 sm:h-36"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <filter id="officer-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Head — white translucent like The Lost */}
            <ellipse cx="50" cy="32" rx="14" ry="16"
              fill="hsl(210 5% 70%)" opacity={fillOpacity}
              stroke="white" strokeWidth="0.5" strokeOpacity={strokeOpacity}
            />
            {/* Eyes - only visible when looking up */}
            {lookingUp && (
              <>
                <ellipse cx="44" cy="30" rx="2" ry="2.5" fill="hsl(0 0% 12%)" opacity={fillOpacity * 1.2} />
                <ellipse cx="56" cy="30" rx="2" ry="2.5" fill="hsl(0 0% 12%)" opacity={fillOpacity * 1.2} />
              </>
            )}
            {/* Cap — grey-white, faint outline */}
            <rect x="34" y="18" width="32" height="8" rx="2"
              fill="hsl(210 5% 55%)" opacity={fillOpacity * 0.9}
              stroke="white" strokeWidth="0.4" strokeOpacity={strokeOpacity * 0.6}
            />
            <rect x="30" y="24" width="40" height="4" rx="1"
              fill="hsl(210 5% 50%)" opacity={fillOpacity * 0.8}
            />
            {/* Body — grey uniform, translucent like Lost */}
            <path
              d="M36 48 Q32 100 30 190 L42 190 L44 130 L50 140 L56 130 L58 190 L70 190 Q68 100 64 48 Z"
              fill="hsl(210 5% 55%)" opacity={fillOpacity}
              stroke="white" strokeWidth="0.5" strokeOpacity={strokeOpacity * 0.5}
            />
            {/* Collar */}
            <path d="M36 48 Q50 56 64 48 L62 60 L50 64 L38 60 Z"
              fill="hsl(210 5% 65%)" opacity={fillOpacity * 0.9}
            />
            {/* Arms */}
            <path d="M36 52 Q26 80 24 120 L32 118 Q30 84 38 64 Z"
              fill="hsl(210 5% 58%)" opacity={fillOpacity}
              stroke="white" strokeWidth="0.3" strokeOpacity={strokeOpacity * 0.4}
            />
            <path d="M64 52 Q74 80 76 120 L68 118 Q70 84 62 64 Z"
              fill="hsl(210 5% 58%)" opacity={fillOpacity}
              stroke="white" strokeWidth="0.3" strokeOpacity={strokeOpacity * 0.4}
            />
            {/* Clipboard */}
            {!settingDown && (
              <g opacity={fillOpacity * 0.85}>
                <rect x="18" y="100" width="14" height="20" rx="1"
                  fill="hsl(38 15% 40%)" stroke="white" strokeWidth="0.3" strokeOpacity={strokeOpacity * 0.5}
                />
                <rect x="20" y="103" width="10" height="1" fill="hsl(38 20% 55%)" opacity="0.4" />
                <rect x="20" y="106" width="10" height="1" fill="hsl(38 20% 55%)" opacity="0.4" />
                <rect x="20" y="109" width="7" height="1" fill="hsl(38 20% 55%)" opacity="0.4" />
                <rect x="20" y="112" width="10" height="1" fill="hsl(38 20% 55%)" opacity="0.4" />
              </g>
            )}
            {/* Buttons on uniform */}
            <circle cx="50" cy="72" r="1.5" fill="hsl(210 5% 70%)" opacity={fillOpacity * 0.7} />
            <circle cx="50" cy="82" r="1.5" fill="hsl(210 5% 70%)" opacity={fillOpacity * 0.7} />
            <circle cx="50" cy="92" r="1.5" fill="hsl(210 5% 70%)" opacity={fillOpacity * 0.7} />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export const SemperReview = () => {
  const [gameState, setGameState] = useState<"idle" | "setup" | "playing" | "win" | "lose">("setup");
  const [questions, setQuestions] = useState<Question[]>(() => buildQuestions());
  const [currentQ, setCurrentQ] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [officerPos, setOfficerPos] = useState(0);
  const [lookingUp, setLookingUp] = useState(false);
  const [settingDown, setSettingDown] = useState(false);
  const [showDiscrepancy, setShowDiscrepancy] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [showAnomaly, setShowAnomaly] = useState(false);
  const [showDissolve, setShowDissolve] = useState(false);
  const [showHiddenLine, setShowHiddenLine] = useState(false);
  const [scrollAwarded, setScrollAwarded] = useState(false);
  const [firstWin, setFirstWin] = useState(false);
  const hasWonBefore = typeof window !== "undefined" && localStorage.getItem("semper-review-won") === "true";

  const startGame = useCallback(() => {
    setQuestions(buildQuestions());
    setCurrentQ(0);
    setWrongCount(0);
    setOfficerPos(0);
    setLookingUp(false);
    setSettingDown(false);
    setShowDiscrepancy(false);
    setShowCheck(false);
    setShowAnomaly(false);
    setShowDissolve(false);
    setShowHiddenLine(false);
    setScrollAwarded(false);
    setFirstWin(false);
    setGameState("setup");
    setTimeout(() => setGameState("playing"), 3000);
  }, []);

  const isExtendedReview = currentQ >= 5;
  const headerColor = isExtendedReview
    ? `hsl(0 ${Math.min(40, (currentQ - 4) * 13)}% ${85 - (currentQ - 4) * 5}%)`
    : "hsl(0 0% 88%)";

  const handleAnswer = useCallback(
    (answer: boolean) => {
      if (gameState !== "playing") return;
      const q = questions[currentQ];
      const isCorrect = answer === q.answer;
      const isFixed = q.pool === "fixed";

      if (isCorrect) {
        // Correct: check mark
        setShowCheck(true);
        setTimeout(() => {
          setShowCheck(false);
          advanceQuestion();
        }, 800);
      } else {
        // Wrong answer
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);

        // Fixed question FALSE = look up behavior
        if (isFixed && !answer) {
          setLookingUp(true);
          setTimeout(() => setLookingUp(false), 1800);
        }

        // Discrepancy stamp
        setShowDiscrepancy(true);

        // Move officer closer
        setOfficerPos((prev) => Math.min(prev + 1, 3));

        setTimeout(() => {
          setShowDiscrepancy(false);
          if (newWrong >= 3) {
            // Game over
            setSettingDown(true);
            setTimeout(() => setGameState("lose"), 1500);
          } else {
            advanceQuestion();
          }
        }, 1500);
      }
    },
    [gameState, questions, currentQ, wrongCount]
  );

  const advanceQuestion = useCallback(() => {
    const nextQ = currentQ + 1;

    // Show anomaly between Q5 and Q6
    if (nextQ === 5) {
      setShowAnomaly(true);
      setTimeout(() => {
        setCurrentQ(nextQ);
      }, 2000);
      return;
    }

    if (nextQ >= questions.length) {
      // Win!
      handleWin();
      return;
    }
    setCurrentQ(nextQ);
  }, [currentQ, questions.length]);

  const handleWin = useCallback(() => {
    setGameState("win");
    // Award scroll
    awardScroll(SCROLL_ID);
    setScrollAwarded(true);
    // Set localStorage flag
    const isFirst = !localStorage.getItem("semper-review-won");
    localStorage.setItem("semper-review-won", "true");
    setFirstWin(isFirst);

    // Dissolve sequence
    setTimeout(() => setShowDissolve(true), 2000);
    setTimeout(() => setShowHiddenLine(true), 3000);
    setTimeout(() => setShowHiddenLine(false), 5000);
  }, []);

  // Auto-start: transition from setup to playing after mount
  useEffect(() => {
    if (gameState === "setup") {
      const t = setTimeout(() => setGameState("playing"), 3000);
      return () => clearTimeout(t);
    }
  }, [gameState]);

  if (gameState === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full"
      >
        <div className="w-full max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8">
          {/* The Form */}
          <div className="flex-1 w-full">
            {/* ── Setup screen ── */}
            {gameState === "setup" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="border p-6 sm:p-8 relative"
                style={{
                  borderColor: "hsl(0 0% 25%)",
                  background: "hsl(0 0% 8%)",
                }}
              >
                <p
                  className="font-display text-[8px] sm:text-[9px] tracking-[0.4em] uppercase mb-6 text-center"
                  style={{ color: "hsl(0 0% 60%)" }}
                >
                  SEMPER VERIFICATION - PRE-APOTHEOSIS CLEARANCE - FORM 7 OF 7
                </p>
                <div
                  className="h-px w-full mb-6"
                  style={{ background: "hsl(0 0% 20%)" }}
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="font-narrative italic text-sm sm:text-[0.9375rem] leading-[1.85] text-center"
                  style={{ color: "hsl(0 0% 55%)" }}
                >
                  "Please answer the following statements truthfully. Discrepancies will be noted."
                </motion.p>
              </motion.div>
            )}

            {/* ── Playing screen ── */}
            {gameState === "playing" && questions.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border p-5 sm:p-8 relative"
                style={{
                  borderColor: "hsl(0 0% 25%)",
                  background: "hsl(0 0% 8%)",
                  boxShadow: "inset 0 0 60px hsl(0 0% 4%)",
                }}
              >
                {/* Fold lines texture */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "linear-gradient(0deg, transparent 49%, hsl(0 0% 40%) 49.5%, hsl(0 0% 40%) 50.5%, transparent 51%)",
                    backgroundSize: "100% 60px",
                  }}
                />

                {/* Header */}
                <motion.p
                  animate={{ color: headerColor }}
                  transition={{ duration: 2 }}
                  className="font-display text-[7px] sm:text-[8px] tracking-[0.4em] uppercase mb-6 text-center relative z-10"
                >
                  SEMPER VERIFICATION - PRE-APOTHEOSIS CLEARANCE - FORM 7 OF 7
                </motion.p>

                <div
                  className="h-px w-full mb-6 relative z-10"
                  style={{ background: "hsl(0 0% 20%)" }}
                />

                {/* Question counter */}
                <p
                  className="font-body text-[9px] tracking-[0.3em] uppercase mb-4 relative z-10"
                  style={{ color: "hsl(0 0% 40%)" }}
                >
                  Statement {currentQ + 1} of {questions.length}
                </p>

                {/* Anomaly flag */}
                <AnimatePresence>
                  {showAnomaly && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2 }}
                      className="font-display text-[8px] tracking-[0.3em] uppercase mb-4 relative z-10"
                      style={{ color: "hsl(0 50% 45%)" }}
                    >
                    ANOMALY FLAGGED - EXTENDED REVIEW INITIATED
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Statement */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQ}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10"
                  >
                    <p
                      className="font-narrative text-sm sm:text-[0.9375rem] leading-[1.85] mb-8"
                      style={{ color: "hsl(0 0% 80%)" }}
                    >
                      "{questions[currentQ].statement}"
                    </p>

                    {/* TRUE / FALSE buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleAnswer(true)}
                        className="flex-1 min-h-[52px] font-display text-xs sm:text-sm tracking-[0.2em] uppercase border transition-colors"
                        style={{
                          borderColor: "hsl(38 30% 35%)",
                          color: "hsl(38 30% 55%)",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "hsl(38 40% 50%)";
                          e.currentTarget.style.color = "hsl(38 40% 70%)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "hsl(38 30% 35%)";
                          e.currentTarget.style.color = "hsl(38 30% 55%)";
                        }}
                      >
                        TRUE
                      </button>
                      <button
                        onClick={() => handleAnswer(false)}
                        className="flex-1 min-h-[52px] font-display text-xs sm:text-sm tracking-[0.2em] uppercase border transition-colors"
                        style={{
                          borderColor: "hsl(38 30% 35%)",
                          color: "hsl(38 30% 55%)",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "hsl(38 40% 50%)";
                          e.currentTarget.style.color = "hsl(38 40% 70%)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "hsl(38 30% 35%)";
                          e.currentTarget.style.color = "hsl(38 30% 55%)";
                        }}
                      >
                        FALSE
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Check mark overlay */}
                <AnimatePresence>
                  {showCheck && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-4 right-4 z-20"
                    >
                      <span
                        className="font-display text-2xl"
                        style={{ color: "hsl(0 0% 45%)" }}
                      >
                        ✓
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* DISCREPANCY stamp */}
                <AnimatePresence>
                  {showDiscrepancy && (
                    <motion.div
                      initial={{ opacity: 0, scale: 1.3, rotate: -8 }}
                      animate={{ opacity: 1, scale: 1, rotate: -5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                    >
                      <span
                        className="font-display text-2xl sm:text-3xl tracking-[0.2em] uppercase"
                        style={{
                          color: "hsl(0 65% 45%)",
                          textShadow: "0 0 20px hsl(0 65% 45% / 0.3)",
                          transform: "rotate(-5deg)",
                        }}
                      >
                        DISCREPANCY
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Lose screen ── */}
            {gameState === "lose" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="border p-6 sm:p-8 text-center"
                style={{
                  borderColor: "hsl(0 30% 25%)",
                  background: "hsl(0 0% 6%)",
                }}
              >
                <p
                  className="font-narrative text-sm sm:text-[0.9375rem] leading-[1.85] mb-8"
                  style={{ color: "hsl(0 0% 55%)" }}
                >
                  "Your file has been flagged. Please remain where you are. Someone will come for you shortly."
                </p>
                <button
                  onClick={startGame}
                  className="min-h-[44px] px-6 py-2 font-display text-[10px] tracking-[0.25em] uppercase border transition-colors"
                  style={{
                    borderColor: "hsl(38 30% 35%)",
                    color: "hsl(38 30% 55%)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "hsl(38 40% 50%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "hsl(38 30% 35%)";
                  }}
                >
                  Request Re-evaluation
                </button>
                <button
                  onClick={() => setGameState("idle")}
                  className="block mx-auto mt-4 font-body text-[9px] tracking-[0.2em] uppercase transition-colors"
                  style={{ color: "hsl(0 0% 35%)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 50%)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 35%)")}
                >
                  Exit
                </button>
              </motion.div>
            )}

            {/* ── Win screen ── */}
            {gameState === "win" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="border p-6 sm:p-8 text-center relative overflow-hidden"
                style={{
                  borderColor: "hsl(0 0% 25%)",
                  background: "hsl(0 0% 6%)",
                }}
              >
                <p
                  className="font-display text-xs sm:text-sm tracking-[0.3em] uppercase mb-6"
                  style={{ color: "hsl(0 0% 65%)" }}
                >
                  You are cleared for entry.
                </p>

                {/* Dissolving form */}
                <AnimatePresence>
                  {!showDissolve && (
                    <motion.div
                      exit={{ opacity: 0, filter: "blur(8px)" }}
                      transition={{ duration: 2 }}
                      className="mb-6"
                    >
                      <div
                        className="h-px w-full mb-3"
                        style={{ background: "hsl(0 0% 20%)" }}
                      />
                      <p
                        className="font-body text-[8px] tracking-[0.2em] uppercase"
                        style={{ color: "hsl(0 0% 30%)" }}
                      >
                       Form 7 of 7 - Complete
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hidden line — visible briefly */}
                <AnimatePresence>
                  {showHiddenLine && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="font-body text-[8px] sm:text-[9px] tracking-[0.15em] leading-[1.8] mb-6"
                      style={{ color: "hsl(0 0% 45%)" }}
                    >
                      Subject demonstrates acceptable loyalty threshold. Flag for monitoring. Authorization: V-7.
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Scroll awarded */}
                {scrollAwarded && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 5.5, duration: 1 }}
                    className="font-body text-[9px] tracking-[0.25em] uppercase mb-4"
                    style={{ color: "hsl(38 60% 50%)" }}
                  >
                    ✦ Scroll 8 discovered ✦
                  </motion.p>
                )}

                {/* Bestiary discovery — first win only */}
                {firstWin && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 6.5, duration: 1 }}
                  >
                    <p
                      className="font-narrative italic text-xs sm:text-sm mb-2"
                      style={{ color: "hsl(38 25% 55%)" }}
                    >
                      A new entry has been added to the Bestiary.
                    </p>
                    <Link
                      to="/bestiary"
                      className="font-body text-[9px] tracking-[0.25em] uppercase transition-colors"
                      style={{ color: "hsl(38 50% 45%)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(38 72% 55%)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(38 50% 45%)")}
                    >
                      ◈ Open the Bestiary ◈
                    </Link>
                  </motion.div>
                )}

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 7.5, duration: 0.6 }}
                  onClick={() => setGameState("idle")}
                  className="block mx-auto mt-6 font-body text-[9px] tracking-[0.2em] uppercase transition-colors"
                  style={{ color: "hsl(0 0% 35%)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 50%)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 35%)")}
                >
                  Exit
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Peace Officer — right side on desktop, below on mobile */}
          {(gameState === "playing" || gameState === "setup" || gameState === "lose") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex items-end justify-end sm:self-end overflow-hidden"
              style={{ minWidth: 80 }}
            >
              <PeaceOfficer
                position={officerPos}
                lookingUp={lookingUp}
                settingDown={settingDown}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Trigger panel for Timeline page ────────────────────────────────────────────
export const SemperReviewTrigger = () => {
  const [gameActive, setGameActive] = useState(false);

  return (
    <>
      <div
        className="border p-5 sm:p-6 text-center"
        style={{
          borderColor: "hsl(38 25% 28%)",
          background: "hsl(20 10% 7%)",
        }}
      >
        <p
          className="font-display text-[8px] sm:text-[9px] tracking-[0.35em] uppercase mb-3 leading-[1.8]"
          style={{ color: "hsl(0 0% 55%)" }}
        >
          SEMPER VERIFICATION REQUIRED — All Citizens approaching Apex must complete Form 7 of 7 before proceeding.
        </p>
        <div
          className="h-px w-16 mx-auto mb-4"
          style={{ background: "hsl(38 25% 28%)" }}
        />
        <button
          onClick={() => setGameActive(true)}
          className="min-h-[44px] px-6 py-2 font-display text-[10px] tracking-[0.25em] uppercase border transition-colors"
          style={{
            borderColor: "hsl(38 30% 35%)",
            color: "hsl(38 30% 55%)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "hsl(38 45% 50%)";
            e.currentTarget.style.color = "hsl(38 45% 65%)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "hsl(38 30% 35%)";
            e.currentTarget.style.color = "hsl(38 30% 55%)";
          }}
        >
          Begin Review
        </button>
      </div>

      {gameActive && <SemperReviewGame onClose={() => setGameActive(false)} />}
    </>
  );
};

// ── Wrapper that passes onClose ────────────────────────────────────────────────
const SemperReviewGame = ({ onClose }: { onClose: () => void }) => {
  const [gameState, setGameState] = useState<"setup" | "playing" | "win" | "lose">("setup");
  const [questions, setQuestions] = useState<Question[]>(() => buildQuestions());
  const [currentQ, setCurrentQ] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [officerPos, setOfficerPos] = useState(0);
  const [lookingUp, setLookingUp] = useState(false);
  const [settingDown, setSettingDown] = useState(false);
  const [showDiscrepancy, setShowDiscrepancy] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [showAnomaly, setShowAnomaly] = useState(false);
  const [showDissolve, setShowDissolve] = useState(false);
  const [showHiddenLine, setShowHiddenLine] = useState(false);
  const [scrollAwarded, setScrollAwarded] = useState(false);
  const [firstWin, setFirstWin] = useState(false);
  const [answering, setAnswering] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGameState("playing"), 3000);
    return () => clearTimeout(t);
  }, []);

  const restart = useCallback(() => {
    setQuestions(buildQuestions());
    setCurrentQ(0);
    setWrongCount(0);
    setOfficerPos(0);
    setLookingUp(false);
    setSettingDown(false);
    setShowDiscrepancy(false);
    setShowCheck(false);
    setShowAnomaly(false);
    setShowDissolve(false);
    setShowHiddenLine(false);
    setScrollAwarded(false);
    setFirstWin(false);
    setAnswering(false);
    setGameState("setup");
    setTimeout(() => setGameState("playing"), 3000);
  }, []);

  const doAdvance = useCallback(
    (nextQ: number) => {
      if (nextQ >= questions.length) {
        // Win
        setGameState("win");
        awardScroll(SCROLL_ID);
        setScrollAwarded(true);
        const isFirst = !localStorage.getItem("semper-review-won");
        localStorage.setItem("semper-review-won", "true");
        setFirstWin(isFirst);
        setTimeout(() => setShowDissolve(true), 2000);
        setTimeout(() => setShowHiddenLine(true), 3000);
        setTimeout(() => setShowHiddenLine(false), 5000);
        return;
      }

      // Show anomaly between Q5 and Q6
      if (nextQ === 5 && !showAnomaly) {
        setShowAnomaly(true);
        setTimeout(() => setCurrentQ(nextQ), 2000);
      } else {
        setCurrentQ(nextQ);
      }
    },
    [questions.length, showAnomaly]
  );

  const handleAnswer = useCallback(
    (answer: boolean) => {
      if (gameState !== "playing" || answering) return;
      setAnswering(true);
      const q = questions[currentQ];
      const isCorrect = answer === q.answer;
      const isFixed = q.pool === "fixed";

      if (isCorrect) {
        setShowCheck(true);
        setTimeout(() => {
          setShowCheck(false);
          setAnswering(false);
          doAdvance(currentQ + 1);
        }, 800);
      } else {
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);

        if (isFixed && !answer) {
          setLookingUp(true);
          setTimeout(() => setLookingUp(false), 1800);
        }

        setShowDiscrepancy(true);
        setOfficerPos((prev) => Math.min(prev + 1, 3));

        setTimeout(() => {
          setShowDiscrepancy(false);
          setAnswering(false);
          if (newWrong >= 3) {
            setSettingDown(true);
            setTimeout(() => setGameState("lose"), 1500);
          } else {
            doAdvance(currentQ + 1);
          }
        }, 1500);
      }
    },
    [gameState, answering, questions, currentQ, wrongCount, doAdvance]
  );

  const isExtendedReview = currentQ >= 5;
  const headerColor = isExtendedReview
    ? `hsl(0 ${Math.min(40, (currentQ - 4) * 13)}% ${85 - (currentQ - 4) * 5}%)`
    : "hsl(0 0% 88%)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto py-4"
      style={{ background: "hsl(0 0% 5% / 0.97)" }}
    >
      <div className="w-full max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8">
        {/* The Form */}
        <div className="flex-1 w-full">
          {/* Setup */}
          {gameState === "setup" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="border p-6 sm:p-8 relative"
              style={{ borderColor: "hsl(0 0% 25%)", background: "hsl(0 0% 8%)" }}
            >
              <p className="font-display text-[8px] sm:text-[9px] tracking-[0.4em] uppercase mb-6 text-center" style={{ color: "hsl(0 0% 60%)" }}>
                SEMPER VERIFICATION - PRE-APOTHEOSIS CLEARANCE - FORM 7 OF 7
              </p>
              <div className="h-px w-full mb-6" style={{ background: "hsl(0 0% 20%)" }} />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1.5 }}
                className="font-narrative italic text-sm sm:text-[0.9375rem] leading-[1.85] text-center"
                style={{ color: "hsl(0 0% 55%)" }}
              >
                "Please answer the following statements truthfully. Discrepancies will be noted."
              </motion.p>
            </motion.div>
          )}

          {/* Playing */}
          {gameState === "playing" && questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border p-5 sm:p-8 relative"
              style={{
                borderColor: "hsl(0 0% 25%)",
                background: "hsl(0 0% 8%)",
                boxShadow: "inset 0 0 60px hsl(0 0% 4%)",
              }}
            >
              {/* Fold lines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: "linear-gradient(0deg, transparent 49%, hsl(0 0% 40%) 49.5%, hsl(0 0% 40%) 50.5%, transparent 51%)",
                  backgroundSize: "100% 60px",
                }}
              />

              <motion.p
                animate={{ color: headerColor }}
                transition={{ duration: 2 }}
                className="font-display text-[7px] sm:text-[8px] tracking-[0.4em] uppercase mb-6 text-center relative z-10"
              >
                SEMPER VERIFICATION - PRE-APOTHEOSIS CLEARANCE - FORM 7 OF 7
              </motion.p>

              <div className="h-px w-full mb-6 relative z-10" style={{ background: "hsl(0 0% 20%)" }} />

              <p className="font-body text-[9px] tracking-[0.3em] uppercase mb-4 relative z-10" style={{ color: "hsl(0 0% 40%)" }}>
                Statement {currentQ + 1} of {questions.length}
              </p>

              {/* Anomaly */}
              <AnimatePresence>
                {showAnomaly && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="font-display text-[8px] tracking-[0.3em] uppercase mb-4 relative z-10"
                    style={{ color: "hsl(0 50% 45%)" }}
                  >
                    ANOMALY FLAGGED - EXTENDED REVIEW INITIATED
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative z-10"
                >
                  <p className="font-narrative text-sm sm:text-[0.9375rem] leading-[1.85] mb-8" style={{ color: "hsl(0 0% 80%)" }}>
                    "{questions[currentQ].statement}"
                  </p>

                  <div className="flex gap-4">
                    {(["TRUE", "FALSE"] as const).map((label) => (
                      <button
                        key={label}
                        onClick={() => handleAnswer(label === "TRUE")}
                        disabled={answering}
                        className="flex-1 min-h-[52px] font-display text-xs sm:text-sm tracking-[0.2em] uppercase border transition-colors disabled:opacity-50"
                        style={{
                          borderColor: "hsl(38 30% 35%)",
                          color: "hsl(38 30% 55%)",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "hsl(38 40% 50%)";
                          e.currentTarget.style.color = "hsl(38 40% 70%)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "hsl(38 30% 35%)";
                          e.currentTarget.style.color = "hsl(38 30% 55%)";
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Check */}
              <AnimatePresence>
                {showCheck && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 right-4 z-20"
                  >
                    <span className="font-display text-2xl" style={{ color: "hsl(0 0% 45%)" }}>✓</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DISCREPANCY */}
              <AnimatePresence>
                {showDiscrepancy && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.3, rotate: -8 }}
                    animate={{ opacity: 1, scale: 1, rotate: -5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                  >
                    <span
                      className="font-display text-2xl sm:text-3xl tracking-[0.2em] uppercase"
                      style={{ color: "hsl(0 65% 45%)", textShadow: "0 0 20px hsl(0 65% 45% / 0.3)" }}
                    >
                      DISCREPANCY
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Lose */}
          {gameState === "lose" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="border p-6 sm:p-8 text-center"
              style={{ borderColor: "hsl(0 30% 25%)", background: "hsl(0 0% 6%)" }}
            >
              <p className="font-narrative text-sm sm:text-[0.9375rem] leading-[1.85] mb-8" style={{ color: "hsl(0 0% 55%)" }}>
                "Your file has been flagged. Please remain where you are. Someone will come for you shortly."
              </p>
              <button
                onClick={restart}
                className="min-h-[44px] px-6 py-2 font-display text-[10px] tracking-[0.25em] uppercase border transition-colors"
                style={{ borderColor: "hsl(38 30% 35%)", color: "hsl(38 30% 55%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(38 40% 50%)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(38 30% 35%)")}
              >
                Request Re-evaluation
              </button>
              <button
                onClick={onClose}
                className="block mx-auto mt-4 font-body text-[9px] tracking-[0.2em] uppercase transition-colors"
                style={{ color: "hsl(0 0% 35%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 50%)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 35%)")}
              >
                Exit
              </button>
            </motion.div>
          )}

          {/* Win */}
          {gameState === "win" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="border p-6 sm:p-8 text-center relative overflow-hidden"
              style={{ borderColor: "hsl(0 0% 25%)", background: "hsl(0 0% 6%)" }}
            >
              <p className="font-display text-xs sm:text-sm tracking-[0.3em] uppercase mb-6" style={{ color: "hsl(0 0% 65%)" }}>
                You are cleared for entry.
              </p>

              <AnimatePresence>
                {!showDissolve && (
                  <motion.div exit={{ opacity: 0, filter: "blur(8px)" }} transition={{ duration: 2 }} className="mb-6">
                    <div className="h-px w-full mb-3" style={{ background: "hsl(0 0% 20%)" }} />
                    <p className="font-body text-[8px] tracking-[0.2em] uppercase" style={{ color: "hsl(0 0% 30%)" }}>
                      Form 7 of 7 - Complete
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showHiddenLine && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-body text-[8px] sm:text-[9px] tracking-[0.15em] leading-[1.8] mb-6"
                    style={{ color: "hsl(0 0% 45%)" }}
                  >
                    Subject demonstrates acceptable loyalty threshold. Flag for monitoring. Authorization: V-7.
                  </motion.p>
                )}
              </AnimatePresence>

              {scrollAwarded && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 5.5, duration: 1 }}
                  className="font-body text-[9px] tracking-[0.25em] uppercase mb-4"
                  style={{ color: "hsl(38 60% 50%)" }}
                >
                  ✦ Scroll 8 discovered ✦
                </motion.p>
              )}

              {firstWin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 6.5, duration: 1 }}
                >
                  <p className="font-narrative italic text-xs sm:text-sm mb-2" style={{ color: "hsl(38 25% 55%)" }}>
                    A new entry has been added to the Bestiary.
                  </p>
                  <Link
                    to="/bestiary"
                    className="font-body text-[9px] tracking-[0.25em] uppercase transition-colors"
                    style={{ color: "hsl(38 50% 45%)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(38 72% 55%)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(38 50% 45%)")}
                  >
                    ◈ Open the Bestiary ◈
                  </Link>
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 7.5, duration: 0.6 }}
                onClick={onClose}
                className="block mx-auto mt-6 font-body text-[9px] tracking-[0.2em] uppercase transition-colors"
                style={{ color: "hsl(0 0% 35%)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 50%)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 35%)")}
              >
                Exit
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Peace Officer */}
        {(gameState === "playing" || gameState === "setup" || gameState === "lose") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex items-end justify-end sm:self-end overflow-hidden"
            style={{ minWidth: 80 }}
          >
            <PeaceOfficer position={officerPos} lookingUp={lookingUp} settingDown={settingDown} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
