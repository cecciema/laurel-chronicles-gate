import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/components/ChroniclesSystem";

// ─── Maze Layout ──────────────────────────────────────────────────────────────
// 0 = open path, 1 = wall
// 25 × 21 grid — large enough to feel like a real labyrinth
// Dead-ends are marked by looking like open corridors that terminate abruptly
const RAW_MAZE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,0,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const ROWS = RAW_MAZE.length;      // 21
const COLS = RAW_MAZE[0].length;   // 25
const PLAYER_START = { row: 1, col: 1 };
const EXIT = { row: 19, col: 24 };
const VISIBILITY = 4;

// ── Three separate patrol routes that increasingly overlap as time passes ──────
const PATROL_A = [
  { row: 5, col: 1 },  { row: 5, col: 7 },  { row: 7, col: 7 },
  { row: 7, col: 1 },  { row: 5, col: 1 },  { row: 13, col: 1 },
  { row: 13, col: 9 }, { row: 13, col: 23 }, { row: 19, col: 23 },
  { row: 19, col: 1 }, { row: 13, col: 1 },  { row: 5, col: 1 },
];
const PATROL_B = [
  { row: 1, col: 23 }, { row: 1, col: 11 }, { row: 5, col: 11 },
  { row: 5, col: 23 }, { row: 9, col: 23 }, { row: 9, col: 11 },
  { row: 13, col: 11 },{ row: 13, col: 23 },{ row: 1, col: 23 },
];
const PATROL_C = [
  { row: 3, col: 5 },  { row: 3, col: 17 }, { row: 9, col: 17 },
  { row: 9, col: 5 },  { row: 15, col: 5 }, { row: 15, col: 17 },
  { row: 19, col: 17 },{ row: 19, col: 5 }, { row: 3, col: 5 },
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

// ─── Maze Canvas ──────────────────────────────────────────────────────────────
const TILE_SIZE = 20;

interface Enemy { pos: Pos; patrolIdx: number; progress: number; }

interface MazeCanvasProps {
  player: Pos;
  enemies: Enemy[];
  won: boolean;
}

const MazeCanvas = ({ player, enemies, won }: MazeCanvasProps) => (
  <div className="relative overflow-auto mx-auto" style={{ maxWidth: "100%", overflowX: "auto", overflowY: "auto" }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${COLS}, ${TILE_SIZE}px)`,
      gridTemplateRows: `repeat(${ROWS}, ${TILE_SIZE}px)`,
      gap: 0,
      width: `${COLS * TILE_SIZE}px`,
      margin: "0 auto",
    }}>
      {RAW_MAZE.map((row, r) =>
        row.map((cell, c) => {
          const pos = { row: r, col: c };
          const visible = isVisible(player, pos) || won;
          const isExit = r === EXIT.row && c === EXIT.col;
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
                  background: "hsl(38 80% 60%)",
                  boxShadow: "0 0 8px hsl(38 80% 60%), 0 0 16px hsl(38 72% 50% / 0.5)",
                  zIndex: 10,
                }} />
              )}
              {isEnemyPos && visible && (
                <div style={{
                  position: "absolute", inset: 3, borderRadius: "50%",
                  background: "hsl(0 0% 80%)",
                  boxShadow: "0 0 6px hsl(0 0% 90% / 0.6)",
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

const SCROLL_ID = 1;
const BESTIARY_FIRST_WIN_KEY = "bestiary_first_win_dead_corridors";

const makeEnemy = (patrol: Pos[], idx = 0): Enemy => ({ pos: patrol[idx], patrolIdx: idx, progress: 0 });

export const DeadCorridors = () => {
  const { foundScrolls, foundScroll } = useGame();
  const [player, setPlayer] = useState<Pos>(PLAYER_START);
  const [enemies, setEnemies] = useState<Enemy[]>([makeEnemy(PATROL_A)]);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [won, setWon] = useState(false);
  const [bestiaryUnlocked, setBestiaryUnlocked] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds since game start
  const spawnBRef = useRef(false);
  const spawnCRef = useRef(false);

  const alreadyWon = foundScrolls.includes(SCROLL_ID);

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
    setEnemies(prev => [...prev, makeEnemy(PATROL_B)]);
  }, [elapsed, phase]);

  // ── Spawn third enemy at 30s ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || spawnCRef.current || elapsed < 30) return;
    spawnCRef.current = true;
    setEnemies(prev => [...prev, makeEnemy(PATROL_C)]);
  }, [elapsed, phase]);

  // ── Enemy movement ──────────────────────────────────────────────────────────
  // Enemy 0 (A): base speed ~0.04/tick @ 40ms = 1 tile/sec
  // Enemy 1 (B): 1.35× faster
  // Enemy 2 (C): 1.7× faster
  const SPEEDS = [0.04, 0.054, 0.068];
  const PATROLS = [PATROL_A, PATROL_B, PATROL_C];

  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setEnemies(prev =>
        prev.map((enemy, idx) => {
          const patrol = PATROLS[idx];
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

  // ── Collision — instant death on any contact ────────────────────────────────
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
        return isWall(np) ? p : np;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // ── Win detection ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (player.row === EXIT.row && player.col === EXIT.col && phase === "playing") {
      setPhase("won");
      setWon(true);
      setBestiaryUnlocked(true);
      if (!alreadyWon) foundScroll(SCROLL_ID);
    }
  }, [player, phase, alreadyWon, foundScroll]);

  // ── Swipe support ───────────────────────────────────────────────────────────
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
    setPlayer(p => {
      const np = { row: p.row + d.row, col: p.col + d.col };
      return isWall(np) ? p : np;
    });
  }, [phase]);

  // ── Restart ─────────────────────────────────────────────────────────────────
  const handleRestart = () => {
    setPlayer(PLAYER_START);
    setEnemies([makeEnemy(PATROL_A)]);
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
          The southern hemisphere has been burnt for a century. Not everything that was left behind stayed dead.
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
                  background: dangerPct < 0.5 ? "hsl(38 72% 50%)" : dangerPct < 0.9 ? "hsl(25 80% 45%)" : "hsl(0 65% 48%)",
                }}
              />
            </div>
          </div>
        )}
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
        <div className="p-2 sm:p-3 overflow-auto">
          <MazeCanvas player={player} enemies={enemies} won={won} />
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
