import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGame } from "@/components/ChroniclesSystem";

// ── Constants ──────────────────────────────────────────────────────────────────
const SCROLL_ID = 10;

// ── Constants ──────────────────────────────────────────────────────────────────
const ROWS = 15;
const COLS = 15;
const TILE_SIZE = 20;
const TOTAL_PARTICIPANTS = 10;
const SWAPS_TO_WIN = 7;
const MAX_CATCHES = 3;
const TOTAL_TIME = 15;
const THIRD_DEVOTEE_TIME = 1;

type Pos = { row: number; col: number };

// ── Layout ─────────────────────────────────────────────────────────────────────
// Walls on all edges, open interior
const isWall = (r: number, c: number): boolean =>
  r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;

// Decorative tiles (candles/pillars on inner edge)
const isDecorative = (r: number, c: number): boolean => {
  if (r === 1 && (c === 1 || c === 4 || c === 7 || c === 10 || c === 13)) return true;
  if (r === 13 && (c === 1 || c === 4 || c === 7 || c === 10 || c === 13)) return true;
  if (c === 1 && (r === 4 || r === 7 || r === 10)) return true;
  if (c === 13 && (r === 4 || r === 7 || r === 10)) return true;
  return false;
};

// Participant positions: front row (row 7), back row (row 9), cols 3-11
const PARTICIPANTS: Pos[] = [
  // Front row
  { row: 7, col: 3 }, { row: 7, col: 5 }, { row: 7, col: 7 }, { row: 7, col: 9 }, { row: 7, col: 11 },
  // Back row
  { row: 9, col: 3 }, { row: 9, col: 5 }, { row: 9, col: 7 }, { row: 9, col: 9 }, { row: 9, col: 11 },
];

// ── Devotee patrol routes ──────────────────────────────────────────────────────
interface DevoteeConfig {
  route: Pos[];
  speed: number; // steps per second
  active: boolean;
}

const DEVOTEE_CONFIGS: DevoteeConfig[] = [
  // Devotee 1: horizontal across row 6 (in front of front row)
  {
    route: [
      { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
      { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 6, col: 8 }, { row: 6, col: 9 },
      { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 },
      // Return
      { row: 6, col: 11 }, { row: 6, col: 10 }, { row: 6, col: 9 },
      { row: 6, col: 8 }, { row: 6, col: 7 }, { row: 6, col: 6 }, { row: 6, col: 5 },
      { row: 6, col: 4 }, { row: 6, col: 3 }, { row: 6, col: 2 },
    ],
    speed: 0.16,
    active: true,
  },
  // Devotee 2: vertical down column 7 (between the two rows)
  {
    route: [
      { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 },
      { row: 7, col: 8 }, { row: 8, col: 7 }, { row: 9, col: 8 }, { row: 10, col: 7 },
      { row: 11, col: 7 },
      // Return
      { row: 10, col: 7 }, { row: 9, col: 8 }, { row: 8, col: 7 }, { row: 7, col: 8 },
      { row: 6, col: 7 }, { row: 5, col: 7 }, { row: 4, col: 7 }, { row: 3, col: 7 },
    ],
    speed: 0.16,
    active: true,
  },
  // Devotee 3: diagonal/wide route, faster, enters at 45s
  {
    route: [
      { row: 2, col: 7 }, { row: 3, col: 6 }, { row: 4, col: 5 }, { row: 5, col: 4 },
      { row: 6, col: 3 }, { row: 7, col: 4 }, { row: 8, col: 5 }, { row: 9, col: 6 },
      { row: 10, col: 7 }, { row: 10, col: 8 }, { row: 9, col: 9 }, { row: 8, col: 10 },
      { row: 7, col: 11 }, { row: 6, col: 10 }, { row: 5, col: 9 }, { row: 4, col: 8 },
      { row: 3, col: 7 }, { row: 2, col: 7 },
    ],
    speed: 0.16,
    active: true,
  },
];

// ── Distance helper ────────────────────────────────────────────────────────────
function chebyshev(a: Pos, b: Pos): number {
  return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
}

// ── Collector positions by stage ───────────────────────────────────────────────
const COLLECTOR_POS: Pos[] = [
  { row: 2, col: 13 },  // Stage 0: top-right corner, barely visible
  { row: 5, col: 13 },  // Stage 1: right edge center
  { row: 7, col: 12 },  // Stage 2: center-right
  { row: 7, col: 7 },   // Stage 3: center
];

// ── Grid Renderer ──────────────────────────────────────────────────────────────
interface GridProps {
  devotees: Pos[];
  participantStates: boolean[];
  collectorStage: number;
  proximityMap: Map<number, number>; // participant index -> min distance to devotee
  selectedIdx: number | null;
  onTapCell: (r: number, c: number) => void;
  frozen: boolean;
}

const CeremonyGrid = ({
  devotees,
  participantStates,
  collectorStage,
  proximityMap,
  selectedIdx,
  onTapCell,
  frozen,
}: GridProps) => {
  const collectorPos = COLLECTOR_POS[Math.min(collectorStage, 3)];
  const collectorOpacity = collectorStage === 0 ? 0.12 : collectorStage === 1 ? 0.4 : collectorStage === 2 ? 0.65 : 0.95;
  const collectorVialGlow = 0.15 + collectorStage * 0.25;

  return (
    <div className="relative overflow-auto mx-auto" style={{ maxWidth: "100%", overflowX: "auto", overflowY: "auto" }}>
      <div
        key={devotees.map(d => `${d.row},${d.col}`).join("|")}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${TILE_SIZE}px)`,
          gap: 0,
          width: `${COLS * TILE_SIZE}px`,
          margin: "0 auto",
        }}
      >
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const wall = isWall(r, c);
            const deco = isDecorative(r, c);
            const pIdx = PARTICIPANTS.findIndex(p => p.row === r && p.col === c);
            const isParticipant = pIdx >= 0;
            const isDevotee = devotees.some(d => d.row === r && d.col === c);
            const isCollector = collectorPos.row === r && collectorPos.col === c;

            let bg = "hsl(20 10% 9%)"; // floor
            if (wall) bg = "hsl(25 30% 12%)";
            if (deco) bg = "hsl(30 25% 14%)";

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => onTapCell(r, c)}
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: bg,
                  borderRight: wall ? "1px solid hsl(30 40% 16%)" : undefined,
                  borderBottom: wall ? "1px solid hsl(30 40% 14%)" : undefined,
                  position: "relative",
                  boxSizing: "border-box",
                  cursor: isParticipant && !participantStates[pIdx] && !frozen ? "pointer" : "default",
                }}
              >
                {/* Decorative candle flicker */}
                {deco && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "radial-gradient(circle, hsl(38 60% 40% / 0.25), transparent 70%)",
                      animation: "brassPulse 3s ease-in-out infinite",
                    }}
                  />
                )}

                {/* Participant */}
                {isParticipant && (() => {
                  const swapped = participantStates[pIdx];
                  const dist = proximityMap.get(pIdx) ?? 99;
                  const selected = selectedIdx === pIdx;
                  // Safe = no devotee within 2, danger = within 1, blocked = within 2
                  let ringColor = "rgba(212,168,67,0.5)"; // safe = yellow/brass
                  if (dist <= 1) ringColor = "rgba(139,26,26,0.7)"; // danger = red
                  else if (dist <= 2) ringColor = "rgba(201,120,32,0.6)"; // warning = orange

                  const vialColor = swapped ? "#ffffff" : "#d4a843";

                  return (
                    <>
                      {/* Proximity ring (only if not swapped) */}
                      {!swapped && (
                        <div
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            inset: -2,
                            border: `1.5px solid ${ringColor}`,
                            animation: dist <= 1 ? "brassPulse 1s ease-in-out infinite" : undefined,
                          }}
                        />
                      )}
                      {/* Selection ring */}
                      {selected && !swapped && (
                        <div
                          className="absolute rounded-full pointer-events-none z-10"
                          style={{
                            inset: -3,
                            border: "1.5px solid hsl(38 72% 55% / 0.7)",
                            boxShadow: "0 0 8px hsl(38 72% 55% / 0.3)",
                          }}
                        />
                      )}
                      {/* Robed figure (top-down hood view) */}
                      <div
                        className="absolute rounded-full"
                        style={{
                          inset: 3,
                          background: swapped
                            ? "radial-gradient(circle, hsl(0 0% 30%), hsl(0 0% 16%))"
                            : "radial-gradient(circle, hsl(30 15% 22%), hsl(0 0% 16%))",
                          border: "1px solid hsl(0 0% 25%)",
                          animation: frozen ? undefined : "steamRise 6s ease-in-out infinite",
                        }}
                      />
                      {/* Vial dot */}
                      <div
                        className="absolute z-10"
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 1,
                          top: 2,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: vialColor,
                          boxShadow: `0 0 6px ${vialColor}`,
                        }}
                      />
                    </>
                  );
                })()}

                {/* Devotee */}
                {isDevotee && (
                  <div
                    className="absolute rounded-full z-10"
                    style={{
                      inset: 2,
                      background: "hsl(0 0% 82%)",
                      boxShadow: "0 0 6px hsl(0 0% 90% / 0.6)",
                    }}
                  />
                )}

                {/* Collector */}
                {isCollector && (
                  <div
                    className="absolute z-10"
                    style={{
                      inset: 2,
                      borderRadius: "50%",
                      background: `rgba(139,26,26,${collectorOpacity})`,
                      boxShadow: `0 0 ${4 + collectorStage * 3}px rgba(139,26,26,${collectorVialGlow})`,
                      transition: "all 1.5s ease",
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Main Game ──────────────────────────────────────────────────────────────────
type Phase = "playing" | "win" | "lose";

const VialSubstitutionGame = ({ onClose }: { onClose: () => void }) => {
  const { foundScroll } = useGame();
  const [phase, setPhase] = useState<Phase>("playing");
  const [swapped, setSwapped] = useState<boolean[]>(Array(TOTAL_PARTICIPANTS).fill(false));
  const [selected, setSelected] = useState<number | null>(null);
  const [swapCount, setSwapCount] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const [collectorStage, setCollectorStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [frozen, setFrozen] = useState(false);
  const [showAccelMsg, setShowAccelMsg] = useState(false);
  const [collectorText, setCollectorText] = useState<string | null>(null);
  const [loseReason, setLoseReason] = useState<"caught" | "time">("caught");
  const [firstWin, setFirstWin] = useState(!localStorage.getItem("vial-substitution-won"));
  const [devoteePositions, setDevoteePositions] = useState<Pos[]>(
    DEVOTEE_CONFIGS.map(d => d.route[0])
  );
  const [proximityMap, setProximityMap] = useState<Map<number, number>>(new Map());

  const phaseRef = useRef<Phase>("playing");
  const swappedRef = useRef(Array(TOTAL_PARTICIPANTS).fill(false));
  const swapCountRef = useRef(0);
  const caughtRef = useRef(0);
  const startTimeRef = useRef(performance.now());
  const devoteeProgress = useRef(DEVOTEE_CONFIGS.map(() => 0));
  const thirdActivated = useRef(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const resetGame = useCallback(() => {
    const fresh = Array(TOTAL_PARTICIPANTS).fill(false);
    setSwapped(fresh);
    swappedRef.current = fresh;
    setSelected(null);
    setSwapCount(0);
    swapCountRef.current = 0;
    setCaughtCount(0);
    caughtRef.current = 0;
    setCollectorStage(0);
    setTimeLeft(TOTAL_TIME);
    setFrozen(false);
    setShowAccelMsg(false);
    setCollectorText(null);
    // firstWin is initialized from localStorage at mount, no need to reset
    setLoseReason("caught");
    startTimeRef.current = performance.now();
    phaseRef.current = "playing";
    devoteeProgress.current = DEVOTEE_CONFIGS.map(() => 0);
    thirdActivated.current = false;
    setDevoteePositions(DEVOTEE_CONFIGS.map(d => d.route[0]));
    setPhase("playing");
  }, []);

  // ── Timer & third devotee activation (every 500ms) ───────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, TOTAL_TIME - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        phaseRef.current = "lose";
        setLoseReason("time");
        setPhase("lose");
      }
      if (elapsed >= THIRD_DEVOTEE_TIME && !thirdActivated.current) {
        thirdActivated.current = true;
        setShowAccelMsg(true);
        setTimeout(() => setShowAccelMsg(false), 3000);
      }
    }, 500);
    return () => clearInterval(id);
  }, [phase]);

  // ── Devotee movement (every 80ms) ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      if (phaseRef.current !== "playing") return;
      const newPositions: Pos[] = [];
      const newProx = new Map<number, number>();

      DEVOTEE_CONFIGS.forEach((config, di) => {
        const isActive = di < 2 || thirdActivated.current;
        if (!isActive) {
          newPositions.push(config.route[0]);
          return;
        }
        devoteeProgress.current[di] += config.speed;
        const routeLen = config.route.length;
        const idx = Math.floor(devoteeProgress.current[di]) % routeLen;
        const pos = config.route[idx];
        newPositions.push(pos);

        for (let pi = 0; pi < TOTAL_PARTICIPANTS; pi++) {
          const dist = chebyshev(pos, PARTICIPANTS[pi]);
          const current = newProx.get(pi) ?? 99;
          if (dist < current) newProx.set(pi, dist);
        }
      });

      setDevoteePositions([...newPositions]);
      setProximityMap(new Map(newProx));
    }, 80);
    return () => clearInterval(id);
  }, [phase]);

  // ── Tap handler ──────────────────────────────────────────────────────────────
  const getMinDevoteeDist = useCallback((pIdx: number): number => {
    let minDist = 99;
    devoteePositions.forEach((dp, di) => {
      const isActive = di < 2 || thirdActivated.current;
      if (!isActive) return;
      const d = chebyshev(dp, PARTICIPANTS[pIdx]);
      if (d < minDist) minDist = d;
    });
    return minDist;
  }, [devoteePositions]);

  const handleTapCell = useCallback((r: number, c: number) => {
    if (phaseRef.current !== "playing" || frozen) return;

    const pIdx = PARTICIPANTS.findIndex(p => p.row === r && p.col === c);
    if (pIdx < 0) {
      // Tapped empty - cancel selection
      setSelected(null);
      return;
    }
    if (swappedRef.current[pIdx]) return; // already swapped

    if (selected === pIdx) {
      // Second tap — attempt swap
      const dist = getMinDevoteeDist(pIdx);

      if (dist <= 1) {
        // CAUGHT
        const newCaught = caughtRef.current + 1;
        caughtRef.current = newCaught;
        setCaughtCount(newCaught);
        setSelected(null);

        // Reset closest devotee to start
        let closestDi = 0;
        let closestDist = 99;
        devoteePositions.forEach((dp, di) => {
          const isActive = di < 2 || thirdActivated.current;
          if (!isActive) return;
          const dd = chebyshev(dp, PARTICIPANTS[pIdx]);
          if (dd < closestDist) { closestDist = dd; closestDi = di; }
        });
        devoteeProgress.current[closestDi] = 0;

        if (newCaught === 1) {
          setCollectorStage(1);
          setCollectorText("Something has noticed you.");
          setTimeout(() => setCollectorText(null), 3000);
        } else if (newCaught === 2) {
          setCollectorStage(2);
          setCollectorText("It is counting.");
          setTimeout(() => setCollectorText(null), 3000);
        } else if (newCaught >= MAX_CATCHES) {
          setCollectorStage(3);
          setCollectorText("The harvest continues.");
          setFrozen(true);
          setTimeout(() => {
            phaseRef.current = "lose";
            setLoseReason("caught");
            setPhase("lose");
          }, 2000);
        }
      } else if (dist <= 2) {
        // Blocked - warning pulse, no penalty
        setSelected(null);
      } else {
        // SUCCESSFUL SWAP
        const ns = [...swappedRef.current];
        ns[pIdx] = true;
        swappedRef.current = ns;
        setSwapped(ns);
        const nc = swapCountRef.current + 1;
        swapCountRef.current = nc;
        setSwapCount(nc);
        setSelected(null);

        if (nc >= SWAPS_TO_WIN) {
          phaseRef.current = "win";
          setFrozen(true);
          setTimeout(() => {
            setPhase("win");
            foundScroll(SCROLL_ID);
            localStorage.setItem("vial-substitution-won", "true");
          }, 1500);
        }
      }
    } else {
      setSelected(pIdx);
    }
  }, [selected, frozen, getMinDevoteeDist, devoteePositions]);

  const timerFraction = timeLeft / TOTAL_TIME;
  const timerColor = timeLeft > 30 ? "#d4a843" : timeLeft > 15 ? "#c97820" : "#8b1a1a";

  return (
    <section
      ref={gameContainerRef}
      className="py-8 sm:py-12 px-4"
      style={{ touchAction: "none" }}
    >
      {/* Steampunk divider */}
      <div className="max-w-2xl mx-auto mb-8 flex items-center gap-4">
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

      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors min-h-[44px]"
          >
            <ArrowLeft size={12} />
            Map
          </button>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl sm:text-3xl tracking-[0.12em] text-primary"
        >
          The Vial Substitution
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-3 font-narrative italic text-muted-foreground text-[0.9375rem] leading-[1.8]"
        >
          Swap the poisoned vials before the ceremony begins. Avoid the Devotees.
        </motion.p>
        <p className="mt-2 text-[10px] tracking-widest text-muted-foreground/50 font-body uppercase">
          Tap a participant twice to swap · Brass ring = safe · Red ring = danger
        </p>

        {/* Swap counter & catches */}
        {phase === "playing" && (
          <div className="mt-3 flex justify-center gap-6">
            <span className="font-body text-[9px] tracking-[0.25em] uppercase" style={{ color: "hsl(38 40% 50%)" }}>
              Swapped: {swapCount}/{SWAPS_TO_WIN}
            </span>
            <span className="font-body text-[9px] tracking-[0.25em] uppercase" style={{ color: caughtCount > 0 ? "hsl(0 50% 50%)" : "hsl(0 0% 40%)" }}>
              Caught: {caughtCount}/{MAX_CATCHES}
            </span>
          </div>
        )}
      </div>

      {/* Timer bar */}
      {phase === "playing" && (
        <div className="max-w-2xl mx-auto mb-4">
          <div className="h-1 bg-secondary border border-border/50 overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${timerFraction * 100}%`, background: timerColor }}
            />
          </div>
        </div>
      )}

      {/* Accelerating message */}
      <AnimatePresence>
        {showAccelMsg && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mb-3 font-display text-[9px] sm:text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "#c97820" }}
          >
            The ceremony is accelerating.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Collector text */}
      <AnimatePresence>
        {collectorText && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mb-3 font-narrative italic text-sm sm:text-[0.9375rem]"
            style={{ color: "#8b1a1a" }}
          >
            "{collectorText}"
          </motion.p>
        )}
      </AnimatePresence>

      {/* Game grid — hidden when won */}
      {phase !== "win" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto bg-card border border-border relative overflow-hidden select-none"
          style={{ minHeight: 200 }}
        >
          <div className="p-2 sm:p-3 overflow-auto">
            <CeremonyGrid
              devotees={devoteePositions}
              participantStates={swapped}
              collectorStage={collectorStage}
              proximityMap={proximityMap}
              selectedIdx={selected}
              onTapCell={handleTapCell}
              frozen={frozen}
            />
          </div>

          {/* Lose overlay */}
          <AnimatePresence>
            {phase === "lose" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center z-30 gap-6 p-8 text-center"
              >
                <p className="font-display text-xs tracking-[0.25em] text-destructive uppercase">
                  {loseReason === "caught" ? "The harvest continues." : "The ceremony has begun. You were not fast enough."}
                </p>
                <p className="font-narrative italic text-foreground/50 text-[0.9375rem] leading-[1.8] max-w-xs">
                  {loseReason === "caught"
                    ? "You were seen. The Collector has your record now."
                    : "Ten vials. Ten ascensions. The records will show nothing unusual."}
                </p>
                <button
                  onClick={resetGame}
                  className="px-8 py-2.5 border border-primary text-primary font-body text-xs tracking-widest uppercase hover:bg-primary/10 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Win screen — standalone section, replaces grid */}
      <AnimatePresence>
        {phase === "win" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto flex flex-col items-center text-center gap-5 py-12 px-8"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display text-lg sm:text-xl tracking-[0.15em] text-primary"
            >
              The substitution is complete.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="font-display text-xs tracking-[0.25em] uppercase"
              style={{ color: "#d4a843" }}
            >
              Seven of them will wake up. The Pantheon will not understand why.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="font-narrative italic text-foreground/50 text-[0.9375rem] leading-[1.8] max-w-sm"
            >
              The ceremony's records will show ten successful ascensions.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="font-display text-[9px] tracking-[0.4em] uppercase"
              style={{ color: "hsl(38 50% 50%)" }}
            >
              ✦ Scroll 10 Recovered ✦
            </motion.p>

            {firstWin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5, duration: 1 }}
                className="mt-2 flex flex-col items-center gap-2"
              >
                <p className="font-narrative italic text-xs" style={{ color: "hsl(38 30% 55%)" }}>
                  A new entry has been added to the Bestiary.
                </p>
                <Link
                  to="/bestiary"
                  className="font-body text-[9px] tracking-[0.3em] uppercase transition-colors"
                  style={{ color: "hsl(38 60% 50%)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "hsl(38 72% 60%)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "hsl(38 60% 50%)")}
                >
                  View the Bestiary →
                </Link>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5.5, duration: 0.6 }}
            >
              <div className="w-8 h-px bg-primary/40 mx-auto mb-5" />
              <button
                onClick={onClose}
                className="px-8 py-2.5 border border-border text-muted-foreground font-body text-xs tracking-widest uppercase hover:border-primary/40 hover:text-primary transition-colors"
              >
                Return to the Map
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="max-w-2xl mx-auto mt-2 flex flex-wrap gap-4 sm:gap-6 px-2 justify-center sm:justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#d4a843", boxShadow: "0 0 8px rgba(212,168,67,0.6)" }} />
          <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase font-body">Poisoned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#ffffff", boxShadow: "0 0 8px rgba(255,255,255,0.6)" }} />
          <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase font-body">Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#ffffff", boxShadow: "0 0 6px rgba(255,255,255,0.4)" }} />
          <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase font-body">Devotee</span>
        </div>
      </div>

      {/* Bestiary Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto mt-10 border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 border border-border flex items-center justify-center">
            {localStorage.getItem("vial-substitution-won") === "true" ? (
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: "#d4a843",
                  boxShadow: "0 0 8px rgba(212,168,67,0.6)",
                }}
              />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-border">
                <rect x="3" y="7" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] tracking-[0.3em] text-primary uppercase font-body mb-1">
              Bestiary · Ceremonial Entity
            </p>
            <h3 className="font-display text-base tracking-wide text-foreground">
              The Collector
            </h3>
            <div className="mt-3 relative">
              <p
                className="font-narrative text-[0.875rem] text-foreground/70 leading-[1.8] transition-all duration-700"
                style={{
                  filter: localStorage.getItem("vial-substitution-won") === "true" ? "none" : "blur(4px)",
                  userSelect: localStorage.getItem("vial-substitution-won") === "true" ? "text" : "none",
                }}
              >
                It stands at the edge of every ceremony. It carries a single vial. The vial has never been empty. The Collector does not collect vials.
              </p>
              {localStorage.getItem("vial-substitution-won") !== "true" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase font-body">
                    Complete the ceremony to unlock
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

// ── Trigger Panel ─────────────────────────────────────────────────────────────
export const VialSubstitutionTrigger = ({ onStartGame }: { onStartGame: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="max-w-xl mx-auto mt-10 mb-6 border p-5 sm:p-6 text-center"
      style={{
        borderColor: "hsl(38 50% 30% / 0.4)",
        background: "hsl(20 12% 7%)",
      }}
    >
      <p
        className="font-narrative italic text-[0.875rem] sm:text-[0.9375rem] leading-[1.85] mb-4"
        style={{ color: "hsl(38 25% 60%)" }}
      >
        An Apotheosis ceremony is underway at Pantheon Prisma. Ten participants are inside. You know what is in their vials.
      </p>
      <button
        onClick={onStartGame}
        className="font-display text-[10px] tracking-[0.3em] uppercase border px-6 py-3 min-h-[44px] transition-colors"
        style={{
          borderColor: "hsl(38 50% 35% / 0.5)",
          color: "hsl(38 60% 55%)",
          background: "transparent",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "hsl(38 60% 50%)";
          e.currentTarget.style.color = "hsl(38 72% 60%)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "hsl(38 50% 35% / 0.5)";
          e.currentTarget.style.color = "hsl(38 60% 55%)";
        }}
      >
        Enter the Ceremony
      </button>
    </motion.div>
  );
};

export default VialSubstitutionGame;
