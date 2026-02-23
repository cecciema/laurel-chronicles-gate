import { useState, useEffect, useRef, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/components/ChroniclesSystem";

// ─── Maze Layouts (15×15, 0 = open, 1 = wall) ────────────────────────────────

// Maze A - exit bottom-right, winding center path, dead ends near bottom
const MAZE_A: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,1,1],
  [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,1,1,0,1,0,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
const START_A = { row: 1, col: 1 };
const EXIT_A = { row: 13, col: 14 };

// Maze B - exit top-left, start bottom-right, open center trap, path hugs walls
const MAZE_B: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
  [1,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,1,0,0,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,0,0,0,1,0,1,0,1,1,1],
  [1,0,1,0,1,1,1,0,1,0,0,0,0,0,1],
  [1,0,1,0,0,0,1,0,1,1,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,0,0,0,1,0,1],
  [1,0,0,0,0,0,1,1,1,1,1,0,1,0,1],
  [1,1,1,0,1,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
const START_B = { row: 13, col: 14 };
const EXIT_B = { row: 1, col: 0 };

// Maze C - exit middle-right, start top-left, false bottom corridor, doubling back
const MAZE_C: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,0,1,0,1,1,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
const START_C = { row: 1, col: 1 };
const EXIT_C = { row: 7, col: 14 };

// ─── Per-maze config bundles ──────────────────────────────────────────────────
type Pos = { row: number; col: number };

interface MazeConfig {
  grid: number[][];
  start: Pos;
  exit: Pos;
  patrols: Pos[][];
  flavour: string;
}

const MAZE_CONFIGS: MazeConfig[] = [
  {
    grid: MAZE_A,
    start: START_A,
    exit: EXIT_A,
    flavour: "The corridors shift. What was familiar is no longer safe.",
    patrols: [
      // Patrol A-1: top-right sweep (away from player start 1,1)
      [{ row: 1, col: 9 }, { row: 3, col: 9 }, { row: 3, col: 13 }, { row: 5, col: 13 },
       { row: 5, col: 9 }, { row: 1, col: 9 }],
      // Patrol A-2: center vertical
      [{ row: 5, col: 5 }, { row: 7, col: 5 }, { row: 9, col: 5 }, { row: 9, col: 9 },
       { row: 7, col: 9 }, { row: 5, col: 9 }, { row: 5, col: 5 }],
      // Patrol A-3: bottom zone
      [{ row: 11, col: 5 }, { row: 13, col: 5 }, { row: 13, col: 9 }, { row: 11, col: 9 },
       { row: 11, col: 13 }, { row: 9, col: 13 }, { row: 9, col: 9 }, { row: 11, col: 5 }],
    ],
  },
  {
    grid: MAZE_B,
    start: START_B,
    exit: EXIT_B,
    flavour: "The way out is never where you expect it. Start again.",
    patrols: [
      // Patrol B-1: outer-left sweep
      [{ row: 1, col: 1 }, { row: 3, col: 1 }, { row: 5, col: 1 }, { row: 7, col: 1 },
       { row: 9, col: 1 }, { row: 9, col: 3 }, { row: 5, col: 3 }, { row: 3, col: 3 },
       { row: 1, col: 1 }],
      // Patrol B-2: center trap area
      [{ row: 5, col: 5 }, { row: 5, col: 9 }, { row: 7, col: 9 }, { row: 7, col: 5 },
       { row: 9, col: 5 }, { row: 9, col: 9 }, { row: 7, col: 9 }, { row: 5, col: 5 }],
      // Patrol B-3: right-bottom sweep
      [{ row: 9, col: 13 }, { row: 11, col: 13 }, { row: 13, col: 13 }, { row: 13, col: 9 },
       { row: 11, col: 9 }, { row: 11, col: 5 }, { row: 13, col: 5 }, { row: 13, col: 9 },
       { row: 9, col: 13 }],
    ],
  },
  {
    grid: MAZE_C,
    start: START_C,
    exit: EXIT_C,
    flavour: "Every path that feels right leads deeper in. Trust nothing.",
    patrols: [
      // Patrol C-1: top area
      [{ row: 1, col: 1 }, { row: 1, col: 5 }, { row: 3, col: 5 }, { row: 3, col: 1 },
       { row: 5, col: 1 }, { row: 5, col: 5 }, { row: 3, col: 5 }, { row: 1, col: 1 }],
      // Patrol C-2: center corridor
      [{ row: 5, col: 9 }, { row: 7, col: 9 }, { row: 7, col: 5 }, { row: 9, col: 5 },
       { row: 9, col: 9 }, { row: 7, col: 9 }, { row: 7, col: 13 }, { row: 5, col: 9 }],
      // Patrol C-3: bottom sweep
      [{ row: 9, col: 1 }, { row: 11, col: 1 }, { row: 13, col: 1 }, { row: 13, col: 7 },
       { row: 13, col: 13 }, { row: 11, col: 13 }, { row: 11, col: 7 }, { row: 9, col: 3 },
       { row: 9, col: 1 }],
    ],
  },
];

const ROWS = 15;
const COLS = 15;
const VISIBILITY = 4;

function isWallIn(grid: number[][], pos: Pos): boolean {
  if (pos.row < 0 || pos.row >= ROWS || pos.col < 0 || pos.col >= COLS) return true;
  return grid[pos.row][pos.col] === 1;
}

function isVisible(player: Pos, cell: Pos): boolean {
  return Math.abs(player.row - cell.row) <= VISIBILITY && Math.abs(player.col - cell.col) <= VISIBILITY;
}

// ─── Maze Canvas ──────────────────────────────────────────────────────────────
const TILE_SIZE = 20;

interface Enemy { pos: Pos; patrolIdx: number; progress: number; }

interface MazeCanvasProps {
  grid: number[][];
  exit: Pos;
  player: Pos;
  enemies: Enemy[];
  won: boolean;
}

const MazeCanvas = ({ grid, exit, player, enemies, won }: MazeCanvasProps) => (
  <div className="relative overflow-auto mx-auto" style={{ maxWidth: "100%", overflowX: "auto", overflowY: "auto" }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${COLS}, ${TILE_SIZE}px)`,
      gridTemplateRows: `repeat(${ROWS}, ${TILE_SIZE}px)`,
      gap: 0,
      width: `${COLS * TILE_SIZE}px`,
      margin: "0 auto",
    }}>
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const pos = { row: r, col: c };
          const visible = isVisible(player, pos) || won;
          const isExit = r === exit.row && c === exit.col;
          const isPlayerPos = r === player.row && c === player.col;
          const isEnemyPos = enemies.some(e => e.pos.row === r && e.pos.col === c);
          const isWallCell = cell === 1;

          let bg = "hsl(20 10% 5%)";
          if (visible) {
            if (isWallCell) bg = "hsl(25 30% 12%)";
            else bg = "hsl(20 10% 9%)";
            if (isExit) bg = "hsl(38 50% 18%)";
          }

          return (
            <div key={`${r}-${c}`} style={{
              width: TILE_SIZE, height: TILE_SIZE, backgroundColor: bg,
              borderRight: visible && isWallCell ? "1px solid hsl(30 40% 16%)" : undefined,
              borderBottom: visible && isWallCell ? "1px solid hsl(30 40% 14%)" : undefined,
              position: "relative", boxSizing: "border-box", transition: "background-color 0.15s ease",
            }}>
              {isExit && visible && (
                <div style={{
                  position: "absolute", inset: 2, borderRadius: 1,
                  background: "hsl(38 72% 50% / 0.4)",
                  boxShadow: "0 0 8px hsl(38 72% 50% / 0.6)",
                  animation: "pulse 2s ease-in-out infinite",
                }} />
              )}
              {isPlayerPos && (
                <div style={{
                  position: "absolute", inset: 3, borderRadius: "50%",
                  background: "#ffffff",
                  boxShadow: "0 0 8px rgba(255,255,255,0.6), 0 0 16px rgba(255,255,255,0.3)",
                  zIndex: 10,
                }} />
              )}
              {isEnemyPos && visible && (
                <div style={{
                  position: "absolute", inset: 3, borderRadius: "50%",
                  background: "#8b1a1a",
                  boxShadow: "0 0 8px rgba(139,26,26,0.6)",
                  zIndex: 10,
                }} />
              )}
            </div>
          );
        })
      )}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
type GamePhase = "playing" | "dead" | "won";

const SCROLL_ID = 11; // Dead Corridors now awards Scroll 11 - moved to Bestiary page

const makeEnemy = (patrol: Pos[], idx = 0): Enemy => ({ pos: patrol[idx], patrolIdx: idx, progress: 0 });

function pickMaze(excludeIdx?: number): number {
  if (excludeIdx === undefined) return Math.floor(Math.random() * 3);
  const options = [0, 1, 2].filter(i => i !== excludeIdx);
  return options[Math.floor(Math.random() * options.length)];
}

export const DeadCorridors = () => {
  const { foundScrolls, foundScroll } = useGame();
  const [mazeIdx, setMazeIdx] = useState<number>(() => pickMaze());
  const config = MAZE_CONFIGS[mazeIdx];

  const [player, setPlayer] = useState<Pos>(config.start);
  const [enemies, setEnemies] = useState<Enemy[]>([makeEnemy(config.patrols[0])]);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [won, setWon] = useState(false);
  const [bestiaryUnlocked, setBestiaryUnlocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const spawnBRef = useRef(false);
  const spawnCRef = useRef(false);
  const lastMazeRef = useRef(mazeIdx);

  const alreadyWon = foundScrolls.includes(SCROLL_ID);

  // Current maze's grid for wall checks
  const gridRef = useRef(config.grid);
  const exitRef = useRef(config.exit);
  const patrolsRef = useRef(config.patrols);
  gridRef.current = config.grid;
  exitRef.current = config.exit;
  patrolsRef.current = config.patrols;

  // ── Elapsed timer for spawning ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // ── Spawn second enemy at 15s ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || spawnBRef.current || elapsed < 15) return;
    spawnBRef.current = true;
    setEnemies(prev => [...prev, makeEnemy(patrolsRef.current[1])]);
  }, [elapsed, phase]);

  // ── Spawn third enemy at 30s ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || spawnCRef.current || elapsed < 30) return;
    spawnCRef.current = true;
    setEnemies(prev => [...prev, makeEnemy(patrolsRef.current[2])]);
  }, [elapsed, phase]);

  // ── Enemy movement ──────────────────────────────────────────────────────────
  const SPEEDS = [0.04, 0.054, 0.068];

  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setEnemies(prev =>
        prev.map((enemy, idx) => {
          const patrol = patrolsRef.current[idx];
          const speed = SPEEDS[idx];
          const newProgress = enemy.progress + speed;
          if (newProgress >= 1) {
            const nextIdx = (enemy.patrolIdx + 1) % (patrol.length - 1);
            return { pos: patrol[nextIdx], patrolIdx: nextIdx, progress: 0 };
          }
          return { ...enemy, progress: newProgress };
        })
      );
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  // ── Collision - instant death ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const hit = enemies.some(e => e.pos.row === player.row && e.pos.col === player.col);
    if (hit) setPhase("dead");
  }, [enemies, player, phase]);

  // ── Keyboard input ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const dirs: Record<string, Pos> = {
        ArrowUp: { row: -1, col: 0 }, ArrowDown: { row: 1, col: 0 },
        ArrowLeft: { row: 0, col: -1 }, ArrowRight: { row: 0, col: 1 },
      };
      const d = dirs[e.key];
      if (!d) return;
      e.preventDefault();
      setPlayer(p => {
        const np = { row: p.row + d.row, col: p.col + d.col };
        return isWallIn(gridRef.current, np) ? p : np;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // ── Win detection ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (player.row === exitRef.current.row && player.col === exitRef.current.col && phase === "playing") {
      setPhase("won");
      setWon(true);
      setBestiaryUnlocked(true);
      if (!alreadyWon) foundScroll(SCROLL_ID);
      localStorage.setItem('dead-corridors-won', 'true');
    }
  }, [player, phase, alreadyWon, foundScroll]);

  // ── Swipe support ───────────────────────────────────────────────────────────
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const mazeContainerRef = useRef<HTMLDivElement>(null);

  // Attach native touch listeners with { passive: false } to allow preventDefault
  useEffect(() => {
    const el = mazeContainerRef.current;
    if (!el) return;
    const onTs = (e: TouchEvent) => {
      e.preventDefault();
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTm = (e: TouchEvent) => {
      e.preventDefault();
    };
    const onTe = (e: TouchEvent) => {
      if (!touchStart.current || phase !== "playing") return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
      let d: Pos;
      if (Math.abs(dx) > Math.abs(dy)) {
        d = dx > 0 ? { row: 0, col: 1 } : { row: 0, col: -1 };
      } else {
        d = dy > 0 ? { row: 1, col: 0 } : { row: -1, col: 0 };
      }
      setPlayer(p => {
        const np = { row: p.row + d.row, col: p.col + d.col };
        return isWallIn(gridRef.current, np) ? p : np;
      });
    };
    el.addEventListener("touchstart", onTs, { passive: false });
    el.addEventListener("touchmove", onTm, { passive: false });
    el.addEventListener("touchend", onTe);
    return () => {
      el.removeEventListener("touchstart", onTs);
      el.removeEventListener("touchmove", onTm);
      el.removeEventListener("touchend", onTe);
    };
  }, [phase]);

  // ── D-pad move handler ────────────────────────────────────────────────────
  const movePlayer = useCallback((d: Pos) => {
    if (phase !== "playing") return;
    setPlayer(p => {
      const np = { row: p.row + d.row, col: p.col + d.col };
      return isWallIn(gridRef.current, np) ? p : np;
    });
  }, [phase]);

  // ── Restart ─────────────────────────────────────────────────────────────────
  const handleRestart = () => {
    const nextIdx = pickMaze(lastMazeRef.current);
    lastMazeRef.current = nextIdx;
    setMazeIdx(nextIdx);
    const nextConfig = MAZE_CONFIGS[nextIdx];
    setPlayer(nextConfig.start);
    setEnemies([makeEnemy(nextConfig.patrols[0])]);
    setPhase("playing");
    setWon(false);
    setElapsed(0);
    spawnBRef.current = false;
    spawnCRef.current = false;
  };

  // ── Timer color ─────────────────────────────────────────────────────────────
  const dangerPct = Math.min(elapsed / 30, 1);

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
          {config.flavour}
        </motion.p>

        <p className="mt-2 text-[10px] tracking-widest text-muted-foreground/50 font-body uppercase">
          <span className="hidden sm:inline">Arrow keys to move · </span>
          <span className="sm:hidden">Swipe to move · </span>
          Reach the glowing exit · One touch from The Unmarked ends everything
        </p>

        {/* Threat indicator */}
        {phase === "playing" && (
          <div className="mt-3 max-w-xs mx-auto">
            <div className="flex justify-between text-[8px] tracking-widest text-muted-foreground/40 font-body uppercase mb-1">
              <span>Threat level</span>
              <span>
                {elapsed < 15 ? "1 Unmarked" : elapsed < 30 ? "2 Unmarked" : "3 Unmarked"}
              </span>
            </div>
            <div className="h-1 bg-secondary border border-border/50 overflow-hidden">
              <div
                className="h-full transition-all duration-1000"
                style={{
                  width: `${dangerPct * 100}%`,
                  background: dangerPct < 0.5 ? "#d4a843" : dangerPct < 0.9 ? "#c97820" : "#8b1a1a",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Maze container */}
      <motion.div
        ref={mazeContainerRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto bg-card border border-border relative overflow-hidden select-none"
        style={{ minHeight: 200, touchAction: "none" }}
      >
        <div className="p-2 sm:p-3 overflow-auto">
          <MazeCanvas grid={config.grid} exit={config.exit} player={player} enemies={enemies} won={won} />
        </div>

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
              {!alreadyWon && (
                <p className="font-narrative italic text-xs" style={{ color: "hsl(38 30% 55%)" }}>
                  A new entry has been added to the Bestiary.
                </p>
              )}
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

      {/* Mobile swipe hint + D-pad */}
      <div className="sm:hidden max-w-2xl mx-auto mt-4 flex flex-col items-center gap-4">
        <p className="text-[9px] tracking-[0.3em] text-primary/60 uppercase font-body">
          Swipe inside the maze to move
        </p>
        <div className="grid grid-cols-3 gap-1" style={{ width: 164 }}>
          <div />
          <button
            onClick={() => movePlayer({ row: -1, col: 0 })}
            className="flex items-center justify-center border border-primary/40 bg-card hover:bg-primary/10 active:bg-primary/20 transition-colors"
            style={{ width: 52, height: 52 }}
            aria-label="Move up"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3L3 12h12L9 3z" fill="hsl(38 72% 50%)" /></svg>
          </button>
          <div />
          <button
            onClick={() => movePlayer({ row: 0, col: -1 })}
            className="flex items-center justify-center border border-primary/40 bg-card hover:bg-primary/10 active:bg-primary/20 transition-colors"
            style={{ width: 52, height: 52 }}
            aria-label="Move left"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9l9-6v12L3 9z" fill="hsl(38 72% 50%)" /></svg>
          </button>
          <div />
          <button
            onClick={() => movePlayer({ row: 0, col: 1 })}
            className="flex items-center justify-center border border-primary/40 bg-card hover:bg-primary/10 active:bg-primary/20 transition-colors"
            style={{ width: 52, height: 52 }}
            aria-label="Move right"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15 9L6 3v12l9-6z" fill="hsl(38 72% 50%)" /></svg>
          </button>
          <div />
          <button
            onClick={() => movePlayer({ row: 1, col: 0 })}
            className="flex items-center justify-center border border-primary/40 bg-card hover:bg-primary/10 active:bg-primary/20 transition-colors"
            style={{ width: 52, height: 52 }}
            aria-label="Move down"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 15l6-9H3l6 9z" fill="hsl(38 72% 50%)" /></svg>
          </button>
          <div />
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-2xl mx-auto mt-2 flex gap-6 px-2 justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#ffffff", boxShadow: "0 0 8px rgba(255,255,255,0.6)" }} />
          <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase font-body">You</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "#8b1a1a", boxShadow: "0 0 8px rgba(139,26,26,0.6)" }} />
          <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase font-body">The Unmarked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2" style={{ background: "#d4a843", boxShadow: "0 0 8px rgba(212,168,67,0.6)" }} />
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
              <div className="w-4 h-4 rounded-full" style={{ background: "#ffffff", boxShadow: "0 0 8px rgba(255,255,255,0.6)" }} />
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
                Sanctorium records show 214 incomplete Apotheosis events in the last century.
                Parliament records show zero. One of these is lying.
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
