import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/components/ChroniclesSystem";

// ─── Maze Layout ──────────────────────────────────────────────────────────────
// 0 = open path, 1 = wall, S = start (player), E = exit, P = patrol path cell
const RAW_MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,1,0,1,1],
  [1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const ROWS = RAW_MAZE.length;
const COLS = RAW_MAZE[0].length;
const PLAYER_START = { row: 1, col: 1 };
const EXIT = { row: 19, col: 20 };
const VISIBILITY = 4; // tiles radius

// Enemy patrol: a looping list of {row,col} waypoints along open corridors
const PATROL_PATH = [
  { row: 5, col: 1 },
  { row: 5, col: 7 },
  { row: 7, col: 7 },
  { row: 7, col: 1 },
  { row: 5, col: 1 },
  { row: 13, col: 1 },
  { row: 13, col: 9 },
  { row: 13, col: 19 },
  { row: 19, col: 19 },
  { row: 19, col: 1 },
  { row: 13, col: 1 },
  { row: 5, col: 1 },
];

type Pos = { row: number; col: number };

function isWall(pos: Pos): boolean {
  if (pos.row < 0 || pos.row >= ROWS || pos.col < 0 || pos.col >= COLS) return true;
  return RAW_MAZE[pos.row][pos.col] === 1;
}

function isVisible(player: Pos, cell: Pos): boolean {
  const dr = Math.abs(player.row - cell.row);
  const dc = Math.abs(player.col - cell.col);
  return dr <= VISIBILITY && dc <= VISIBILITY;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TILE_SIZE = 22; // px per tile on desktop; scales on mobile

interface MazeCanvasProps {
  player: Pos;
  enemy: Pos;
  won: boolean;
}

const MazeCanvas = ({ player, enemy, won }: MazeCanvasProps) => {
  return (
    <div
      className="relative overflow-auto mx-auto"
      style={{ maxWidth: "100%", overflowX: "auto", overflowY: "auto" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${TILE_SIZE}px)`,
          gap: 0,
          width: `${COLS * TILE_SIZE}px`,
          margin: "0 auto",
        }}
      >
        {RAW_MAZE.map((row, r) =>
          row.map((cell, c) => {
            const pos = { row: r, col: c };
            const visible = isVisible(player, pos) || won;
            const isExit = r === EXIT.row && c === EXIT.col;
            const isPlayerPos = r === player.row && c === player.col;
            const isEnemyPos = r === enemy.row && c === enemy.col;
            const isWallCell = cell === 1;

            let bg = "hsl(20 10% 5%)"; // fog
            if (visible) {
              if (isWallCell) bg = "hsl(25 30% 12%)";
              else bg = "hsl(20 10% 9%)";
              if (isExit) bg = "hsl(38 50% 18%)";
            }

            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: bg,
                  borderRight: visible && isWallCell ? "1px solid hsl(30 40% 16%)" : undefined,
                  borderBottom: visible && isWallCell ? "1px solid hsl(30 40% 14%)" : undefined,
                  position: "relative",
                  boxSizing: "border-box",
                  transition: "background-color 0.15s ease",
                }}
              >
                {/* Exit glow */}
                {isExit && visible && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 2,
                      borderRadius: 1,
                      background: "hsl(38 72% 50% / 0.4)",
                      boxShadow: "0 0 8px hsl(38 72% 50% / 0.6)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                )}
                {/* Player */}
                {isPlayerPos && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 4,
                      borderRadius: "50%",
                      background: "hsl(38 80% 60%)",
                      boxShadow: "0 0 8px hsl(38 80% 60%), 0 0 16px hsl(38 72% 50% / 0.5)",
                      zIndex: 10,
                    }}
                  />
                )}
                {/* Enemy */}
                {isEnemyPos && visible && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 4,
                      borderRadius: "50%",
                      background: "hsl(0 0% 80%)",
                      boxShadow: "0 0 6px hsl(0 0% 90% / 0.6)",
                      zIndex: 10,
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

// ─── Escape Bar ───────────────────────────────────────────────────────────────

interface EscapeBarProps {
  onSuccess: () => void;
  onFail: () => void;
}

const EscapeBar = ({ onSuccess, onFail }: EscapeBarProps) => {
  const [progress, setProgress] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successRef = useRef(false);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 1.5; // fills in ~66 ticks = ~3s at 50ms
        if (next >= 100) {
          clearInterval(intervalRef.current!);
          if (!successRef.current) onFail();
          return 100;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(intervalRef.current!);
  }, [onFail]);

  const handleClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 8) {
      successRef.current = true;
      clearInterval(intervalRef.current!);
      onSuccess();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-30 gap-4 p-6"
    >
      <p className="font-display text-sm tracking-widest text-primary uppercase">The Unmarked is upon you</p>
      <p className="font-body text-xs text-muted-foreground">Click rapidly to break free</p>
      <div className="w-full max-w-xs h-3 bg-secondary border border-border rounded-none overflow-hidden">
        <motion.div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: "hsl(0 65% 48%)",
            transition: "width 0.05s linear",
          }}
        />
      </div>
      <button
        onPointerDown={handleClick}
        className="w-full max-w-xs py-3 border border-primary font-body text-xs tracking-widest uppercase text-primary hover:bg-primary/10 active:scale-95 transition-all select-none touch-none"
      >
        Struggle — {Math.max(0, 8 - clickCount)} hits remaining
      </button>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

type GamePhase = "playing" | "escape" | "dead" | "won";

export const DeadCorridors = () => {
  const { foundScrolls, foundScroll } = useGame();
  const [player, setPlayer] = useState<Pos>(PLAYER_START);
  const [enemy, setEnemy] = useState<Pos>(PATROL_PATH[0]);
  const [patrolIdx, setPatrolIdx] = useState(0);
  const [patrolProgress, setPatrolProgress] = useState(0); // 0..1 between waypoints
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [escapeFailures, setEscapeFailures] = useState(0);
  const [won, setWon] = useState(false);
  const [bestiaryUnlocked, setBestiaryUnlocked] = useState(false);

  const SCROLL_ID = 8; // maze awards scroll #8 (the hidden 8th)
  const alreadyWon = foundScrolls.includes(SCROLL_ID);

  // ── Enemy movement along patrol path at ~0.6 tiles/sec
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setPatrolProgress((prev) => {
        const next = prev + 0.04; // speed: ~25 ticks to cross 1 tile = ~1 tile/sec at 40ms
        if (next >= 1) {
          setPatrolIdx((pi) => {
            const nextIdx = (pi + 1) % (PATROL_PATH.length - 1);
            setEnemy(PATROL_PATH[nextIdx]);
            return nextIdx;
          });
          return 0;
        }
        // interpolate visual position — but we use tile grid, so snap to current waypoint
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  // ── Collision detection
  useEffect(() => {
    if (phase !== "playing") return;
    if (enemy.row === player.row && enemy.col === player.col) {
      setPhase("escape");
    }
  }, [enemy, player, phase]);

  // ── Keyboard input
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const dirs: Record<string, Pos> = {
        ArrowUp: { row: -1, col: 0 },
        ArrowDown: { row: 1, col: 0 },
        ArrowLeft: { row: 0, col: -1 },
        ArrowRight: { row: 0, col: 1 },
      };
      const d = dirs[e.key];
      if (!d) return;
      e.preventDefault();
      setPlayer((p) => {
        const np = { row: p.row + d.row, col: p.col + d.col };
        if (isWall(np)) return p;
        return np;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // ── Win detection
  useEffect(() => {
    if (player.row === EXIT.row && player.col === EXIT.col && phase === "playing") {
      setPhase("won");
      setWon(true);
      setBestiaryUnlocked(true);
      if (!alreadyWon) foundScroll(SCROLL_ID);
    }
  }, [player, phase, alreadyWon, foundScroll]);

  // ── Swipe support
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || phase !== "playing") return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    let d: Pos;
    if (Math.abs(dx) > Math.abs(dy)) {
      d = dx > 0 ? { row: 0, col: 1 } : { row: 0, col: -1 };
    } else {
      d = dy > 0 ? { row: 1, col: 0 } : { row: -1, col: 0 };
    }
    setPlayer((p) => {
      const np = { row: p.row + d.row, col: p.col + d.col };
      if (isWall(np)) return p;
      return np;
    });
  }, [phase]);

  const handleEscapeSuccess = () => {
    setEnemy(PATROL_PATH[0]);
    setPatrolIdx(0);
    setPatrolProgress(0);
    setPhase("playing");
  };

  const handleEscapeFail = () => {
    const next = escapeFailures + 1;
    setEscapeFailures(next);
    if (next >= 2) {
      setPhase("dead");
    } else {
      setEnemy(PATROL_PATH[0]);
      setPatrolIdx(0);
      setPatrolProgress(0);
      setPhase("playing");
    }
  };

  const handleRestart = () => {
    setPlayer(PLAYER_START);
    setEnemy(PATROL_PATH[0]);
    setPatrolIdx(0);
    setPatrolProgress(0);
    setEscapeFailures(0);
    setPhase("playing");
    setWon(false);
  };

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
          The Dead Corridors
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-3 font-narrative italic text-muted-foreground text-[0.9375rem] leading-[1.8]"
        >
          The southern hemisphere has been burnt for a century. Not everything that was left behind stayed dead.
        </motion.p>

        {/* Controls hint */}
        <p className="mt-2 text-[10px] tracking-widest text-muted-foreground/50 font-body uppercase">
          <span className="hidden sm:inline">Arrow keys to move · </span>
          <span className="sm:hidden">Swipe to move · </span>
          Reach the glowing exit · Avoid The Unmarked
        </p>
      </div>

      {/* Maze container */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto bg-card border border-border relative overflow-hidden select-none"
        style={{ minHeight: 200 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Maze grid */}
        <div className="p-2 sm:p-3 overflow-auto">
          <MazeCanvas player={player} enemy={enemy} won={won} />
        </div>

        {/* Escape overlay */}
        {phase === "escape" && (
          <EscapeBar onSuccess={handleEscapeSuccess} onFail={handleEscapeFail} />
        )}

        {/* Dead screen */}
        <AnimatePresence>
          {phase === "dead" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center z-30 gap-6 p-8 text-center"
            >
              <p className="font-display text-xs tracking-[0.25em] text-destructive uppercase">Terminated</p>
              <p className="font-narrative italic text-foreground/70 text-[0.9375rem] leading-[1.8] max-w-xs">
                The Unmarked has found you. You have no semper. You have no record. You never existed.
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

        {/* Win screen */}
        <AnimatePresence>
          {phase === "won" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/92 flex flex-col items-center justify-center z-30 gap-5 p-8 text-center"
            >
              <p className="font-display text-xs tracking-[0.25em] text-primary uppercase">You Survived</p>
              <p className="font-narrative italic text-foreground/70 text-[0.9375rem] leading-[1.8] max-w-sm">
                You made it through the Dead Corridors. A scroll fragment has been added to your collection.
              </p>
              <div className="w-8 h-px bg-primary/40" />
              <button
                onClick={handleRestart}
                className="px-8 py-2.5 border border-border text-muted-foreground font-body text-xs tracking-widest uppercase hover:border-primary/40 hover:text-primary transition-colors"
              >
                Run Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Legend */}
      <div className="max-w-2xl mx-auto mt-2 flex gap-6 px-2 justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "hsl(38 80% 60%)", boxShadow: "0 0 6px hsl(38 80% 60%)" }} />
          <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase font-body">You</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-foreground/60" />
          <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase font-body">The Unmarked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2" style={{ background: "hsl(38 72% 50% / 0.4)", boxShadow: "0 0 4px hsl(38 72% 50% / 0.6)" }} />
          <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase font-body">Exit</span>
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
            {bestiaryUnlocked || alreadyWon ? (
              <div className="w-4 h-4 rounded-full bg-foreground/60" style={{ boxShadow: "0 0 6px hsl(0 0% 80% / 0.4)" }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-border">
                <rect x="3" y="7" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] tracking-[0.3em] text-primary uppercase font-body mb-1">
              Bestiary · Corridor Entity
            </p>
            <h3 className="font-display text-base tracking-wide text-foreground">
              The Unmarked
            </h3>
            <div className="mt-3 relative">
              <p
                className="font-narrative text-[0.875rem] text-foreground/70 leading-[1.8] transition-all duration-700"
                style={{
                  filter: bestiaryUnlocked || alreadyWon ? "none" : "blur(4px)",
                  userSelect: bestiaryUnlocked || alreadyWon ? "text" : "none",
                }}
              >
                The Sanctorium records show 214 incomplete Apotheosis events in the last century.
                The Parliament records show zero. One of these is lying.
              </p>
              {!(bestiaryUnlocked || alreadyWon) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase font-body">
                    Complete the corridors to unlock
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

export default DeadCorridors;
