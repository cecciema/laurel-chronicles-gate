import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// ── Scroll award helper ────────────────────────────────────────────────────────
const SCROLL_ID = 10;

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

// ── Constants ──────────────────────────────────────────────────────────────────
const TOTAL_PARTICIPANTS = 10;
const SWAPS_TO_WIN = 7;
const MAX_CATCHES = 3;
const TOTAL_TIME = 90;
const THIRD_DEVOTEE_TIME = 45;
const DETECTION_RADIUS = 0.12;

// ── Participant positions ─────────────────────────────────────────────────────
function getParticipantX(i: number) {
  return 0.08 + (i / (TOTAL_PARTICIPANTS - 1)) * 0.84;
}

// ── Robed Figure ──────────────────────────────────────────────────────────────
const RobedFigure = ({ swapped, pulseDanger, selected }: { swapped: boolean; pulseDanger: boolean; selected: boolean }) => {
  const vialColor = swapped ? "hsl(200 60% 70%)" : "hsl(38 72% 55%)";
  const vialGlow = swapped ? "hsl(200 60% 70% / 0.5)" : "hsl(38 72% 55% / 0.5)";

  return (
    <div className="relative flex flex-col items-center">
      {selected && (
        <motion.div
          className="absolute -inset-1 rounded-full pointer-events-none z-0"
          style={{ border: "1.5px solid hsl(38 60% 50% / 0.6)", boxShadow: "0 0 10px hsl(38 60% 50% / 0.3)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      <motion.svg
        viewBox="0 0 40 80"
        className="w-5 h-10 sm:w-7 sm:h-14 relative z-10"
        fill="none"
        animate={{ y: [0, -1, 0, 0.5, 0] }}
        transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="20" cy="12" rx="8" ry="9" fill="hsl(0 0% 18%)" />
        <path d="M12 14 Q20 6 28 14" fill="hsl(0 0% 15%)" />
        <path d="M12 18 Q8 50 6 78 L34 78 Q32 50 28 18 Z" fill="hsl(0 0% 16%)" />
        <path d="M16 22 Q20 30 20 78 L20 78 Q20 30 24 22 Z" fill="hsl(0 0% 14%)" opacity="0.5" />
      </motion.svg>
      <motion.div
        className="absolute -bottom-2 z-20"
        animate={pulseDanger ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={pulseDanger ? { duration: 0.5, repeat: Infinity } : {}}
      >
        <div
          className="w-1.5 h-3 sm:w-2 sm:h-4 rounded-sm"
          style={{
            background: pulseDanger ? "hsl(0 70% 50%)" : vialColor,
            boxShadow: `0 0 8px ${pulseDanger ? "hsl(0 70% 50% / 0.6)" : vialGlow}`,
          }}
        />
      </motion.div>
    </div>
  );
};

// ── Devotee Figure ────────────────────────────────────────────────────────────
const DevoteeFigure = () => (
  <svg viewBox="0 0 40 90" className="w-6 h-12 sm:w-8 sm:h-16" fill="none">
    <ellipse cx="20" cy="11" rx="9" ry="10" fill="hsl(0 0% 85%)" opacity="0.9" />
    <path d="M10 16 Q20 6 30 16" fill="hsl(0 0% 80%)" />
    <path d="M10 20 Q6 55 4 88 L36 88 Q34 55 30 20 Z" fill="hsl(0 0% 82%)" opacity="0.85" />
    <path d="M16 24 Q20 35 20 88 L20 88 Q20 35 24 24 Z" fill="hsl(0 0% 78%)" opacity="0.4" />
  </svg>
);

// ── Collector Figure ──────────────────────────────────────────────────────────
const CollectorFigure = ({ stage }: { stage: number }) => {
  const opacity = stage === 0 ? 0.15 : stage === 1 ? 0.4 : stage === 2 ? 0.65 : 0.9;
  const vialGlow = 0.2 + stage * 0.25;

  return (
    <motion.div animate={{ opacity }} transition={{ duration: 1.5 }} className="relative">
      <motion.div
        animate={{ y: [0, -2, 0, 1, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 50 100" className="w-7 h-14 sm:w-10 sm:h-20" fill="none">
          <ellipse cx="25" cy="14" rx="10" ry="12" fill="hsl(150 10% 12%)" />
          <path d="M14 24 Q10 60 8 98 L42 98 Q40 60 36 24 Z" fill="hsl(150 10% 10%)" />
          <path d="M14 28 Q4 50 2 75 L12 73 Q10 52 16 38 Z" fill="hsl(150 10% 11%)" />
          <path d="M36 28 Q46 50 48 75 L38 73 Q40 52 34 38 Z" fill="hsl(150 10% 11%)" />
          <motion.rect
            x="22" y="55" width="6" height="10" rx="2"
            fill="hsl(150 40% 30%)"
            animate={{ opacity: [vialGlow, vialGlow + 0.15, vialGlow] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 0 ${4 + stage * 3}px hsl(150 50% 35% / ${vialGlow}))` }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

// ── Swap Ripple ───────────────────────────────────────────────────────────────
const SwapRipple = ({ x }: { x: number }) => (
  <motion.div
    className="absolute pointer-events-none z-30"
    style={{ left: `${x * 100}%`, top: "50%", transform: "translate(-50%, -50%)" }}
    initial={{ width: 0, height: 0, opacity: 0.7 }}
    animate={{ width: 60, height: 60, opacity: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    <div className="w-full h-full rounded-full" style={{ border: "1.5px solid hsl(200 60% 70% / 0.6)" }} />
  </motion.div>
);

// ── Main Game Component ───────────────────────────────────────────────────────
const VialSubstitutionGame = ({ onClose }: { onClose: () => void }) => {
  const [phase, setPhase] = useState<"playing" | "win" | "lose">("playing");
  const [swapped, setSwapped] = useState<boolean[]>(Array(TOTAL_PARTICIPANTS).fill(false));
  const [selected, setSelected] = useState<number | null>(null);
  const [swapCount, setSwapCount] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const [collectorStage, setCollectorStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [devoteePositions, setDevoteePositions] = useState<number[]>([0.05, 0.95, 0.02]);
  const [ripples, setRipples] = useState<{ id: number; x: number }[]>([]);
  const [showAccelMsg, setShowAccelMsg] = useState(false);
  const [collectorText, setCollectorText] = useState<string | null>(null);
  const [loseReason, setLoseReason] = useState<"caught" | "time">("caught");
  const [firstWin, setFirstWin] = useState(false);
  const [warningParticipants, setWarningParticipants] = useState<Set<number>>(new Set());
  const [frozen, setFrozen] = useState(false);

  const animRef = useRef(0);
  const startTimeRef = useRef(performance.now());
  const caughtRef = useRef(0);
  const swapCountRef = useRef(0);
  const phaseRef = useRef<string>("playing");
  const rippleIdRef = useRef(0);
  const swappedRef = useRef<boolean[]>(Array(TOTAL_PARTICIPANTS).fill(false));
  const devoteeState = useRef([
    { startX: 0.05, endX: 0.52, speed: 0.08, active: true, pos: 0.05, dir: 1 },
    { startX: 0.48, endX: 0.95, speed: 0.07, active: true, pos: 0.95, dir: -1 },
    { startX: 0.02, endX: 0.98, speed: 0.11, active: false, pos: 0.02, dir: 1 },
  ]);

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
    setRipples([]);
    setShowAccelMsg(false);
    setCollectorText(null);
    setFirstWin(false);
    setWarningParticipants(new Set());
    setFrozen(false);
    startTimeRef.current = performance.now();
    phaseRef.current = "playing";
    devoteeState.current = [
      { startX: 0.05, endX: 0.52, speed: 0.08, active: true, pos: 0.05, dir: 1 },
      { startX: 0.48, endX: 0.95, speed: 0.07, active: true, pos: 0.95, dir: -1 },
      { startX: 0.02, endX: 0.98, speed: 0.11, active: false, pos: 0.02, dir: 1 },
    ];
    setPhase("playing");
  }, []);

  // ── Game loop ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    let lastTime = performance.now();
    let thirdShown = false;

    const loop = (now: number) => {
      if (phaseRef.current !== "playing") return;
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const elapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, TOTAL_TIME - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        phaseRef.current = "lose";
        setLoseReason("time");
        setPhase("lose");
        return;
      }

      if (elapsed >= THIRD_DEVOTEE_TIME && !thirdShown) {
        thirdShown = true;
        devoteeState.current[2].active = true;
        setShowAccelMsg(true);
        setTimeout(() => setShowAccelMsg(false), 3000);
      }

      const newPos: number[] = [];
      const warns = new Set<number>();

      devoteeState.current.forEach((d) => {
        if (!d.active) { newPos.push(d.pos); return; }
        d.pos += d.dir * d.speed * dt;
        if (d.pos >= d.endX) { d.pos = d.endX; d.dir = -1; }
        if (d.pos <= d.startX) { d.pos = d.startX; d.dir = 1; }
        newPos.push(d.pos);

        for (let i = 0; i < TOTAL_PARTICIPANTS; i++) {
          if (Math.abs(d.pos - getParticipantX(i)) < DETECTION_RADIUS) warns.add(i);
        }
      });

      setDevoteePositions([...newPos]);
      setWarningParticipants(warns);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  const isDevoteeNear = useCallback((idx: number): boolean => {
    const px = getParticipantX(idx);
    return devoteeState.current.some(d => d.active && Math.abs(d.pos - px) < DETECTION_RADIUS);
  }, []);

  const handleTap = useCallback((idx: number) => {
    if (phase !== "playing" || swappedRef.current[idx] || frozen) return;

    if (selected === idx) {
      // Second tap
      if (isDevoteeNear(idx)) {
        // Caught!
        const newCaught = caughtRef.current + 1;
        caughtRef.current = newCaught;
        setCaughtCount(newCaught);
        setSelected(null);

        // Reset closest devotee
        const px = getParticipantX(idx);
        let ci = 0, cd = Infinity;
        devoteeState.current.forEach((d, i) => {
          if (d.active) { const dist = Math.abs(d.pos - px); if (dist < cd) { cd = dist; ci = i; } }
        });
        devoteeState.current[ci].pos = devoteeState.current[ci].startX;
        devoteeState.current[ci].dir = 1;

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
      } else {
        // Successful swap
        const ns = [...swappedRef.current];
        ns[idx] = true;
        swappedRef.current = ns;
        setSwapped(ns);
        const nc = swapCountRef.current + 1;
        swapCountRef.current = nc;
        setSwapCount(nc);
        setSelected(null);

        const rid = rippleIdRef.current++;
        setRipples(prev => [...prev, { id: rid, x: getParticipantX(idx) }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== rid)), 900);

        if (nc >= SWAPS_TO_WIN) {
          phaseRef.current = "win";
          setFrozen(true);
          // Freeze scene briefly then show win
          setTimeout(() => {
            setPhase("win");
            awardScroll(SCROLL_ID);
            const isFirst = !localStorage.getItem("vial-substitution-won");
            localStorage.setItem("vial-substitution-won", "true");
            setFirstWin(isFirst);
          }, 1500);
        }
      }
    } else {
      setSelected(idx);
    }
  }, [phase, selected, frozen, isDevoteeNear]);

  const handleBgTap = useCallback(() => {
    if (selected !== null) setSelected(null);
  }, [selected]);

  const timerFraction = timeLeft / TOTAL_TIME;
  const timerColor = timeLeft > 30 ? "hsl(38 60% 50%)" : "hsl(0 55% 50%)";
  const collectorX = collectorStage === 0 ? 96 : collectorStage === 1 ? 92 : collectorStage === 2 ? 78 : 52;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col"
      style={{ background: "hsl(20 15% 4% / 0.98)", touchAction: "none" }}
      onClick={handleBgTap}
    >
      {/* Timer bar */}
      {phase === "playing" && (
        <div className="relative w-full h-1.5 flex-shrink-0" style={{ background: "hsl(0 0% 10%)" }}>
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{ width: `${timerFraction * 100}%`, background: timerColor }}
          />
        </div>
      )}

      {/* Accelerating message */}
      <AnimatePresence>
        {showAccelMsg && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute top-4 left-0 right-0 text-center z-40 font-display text-[9px] sm:text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "hsl(0 40% 55%)" }}
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
            transition={{ duration: 0.8 }}
            className="absolute top-8 left-0 right-0 text-center z-40 font-narrative italic text-sm sm:text-[0.9375rem]"
            style={{ color: "hsl(150 20% 50%)" }}
          >
            "{collectorText}"
          </motion.p>
        )}
      </AnimatePresence>

      {/* Swap counter */}
      {phase === "playing" && (
        <div className="absolute top-4 right-4 z-30">
          <p className="font-body text-[9px] tracking-[0.25em] uppercase" style={{ color: "hsl(38 30% 45%)" }}>
            {swapCount}/{SWAPS_TO_WIN}
          </p>
        </div>
      )}

      {/* ── Ceremonial Hall ── */}
      {phase === "playing" && (
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {/* Back wall */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, hsl(25 12% 6%) 0%, hsl(25 8% 8%) 40%, hsl(25 12% 6%) 100%)"
          }} />
          {/* Windows */}
          {[0.15, 0.3, 0.5, 0.7, 0.85].map((x, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${x * 100}%`, top: "5%", width: "2%", height: "35%",
                background: "linear-gradient(180deg, hsl(38 40% 30% / 0.15), transparent)",
                borderRadius: "50% 50% 0 0",
              }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          {/* Candlelight flicker */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.03, 0.06, 0.04, 0.05, 0.03] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "radial-gradient(ellipse at 50% 80%, hsl(38 70% 40% / 0.2), transparent 60%)" }}
          />
          {/* Floor */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%]" style={{
            background: "linear-gradient(180deg, transparent, hsl(25 10% 5%))"
          }} />

          {/* Devotees */}
          {devoteeState.current.map((d, i) => (
            d.active && (
              <div
                key={`dev-${i}`}
                className="absolute z-20 flex flex-col items-center"
                style={{ bottom: "32%", left: `${devoteePositions[i] * 100}%`, transform: "translateX(-50%)" }}
              >
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: `${DETECTION_RADIUS * 200}vw`,
                    height: `${DETECTION_RADIUS * 200}vw`,
                    maxWidth: 160, maxHeight: 160,
                    background: "radial-gradient(circle, hsl(0 50% 45% / 0.08), hsl(0 50% 45% / 0.03) 60%, transparent)",
                    border: "1px solid hsl(0 40% 40% / 0.15)",
                    transform: "translate(-50%, -50%)", left: "50%", top: "50%",
                  }}
                />
                <DevoteeFigure />
              </div>
            )
          ))}

          {/* Participants */}
          {Array.from({ length: TOTAL_PARTICIPANTS }).map((_, i) => {
            const px = getParticipantX(i);
            const isDanger = warningParticipants.has(i) && !swappedRef.current[i];
            return (
              <div
                key={`p-${i}`}
                className="absolute z-10 cursor-pointer"
                style={{ bottom: "28%", left: `${px * 100}%`, transform: "translateX(-50%)" }}
                onClick={e => { e.stopPropagation(); handleTap(i); }}
              >
                <RobedFigure swapped={swappedRef.current[i]} pulseDanger={isDanger} selected={selected === i} />
              </div>
            );
          })}

          {/* Ripples */}
          <AnimatePresence>
            {ripples.map(r => <SwapRipple key={r.id} x={r.x} />)}
          </AnimatePresence>

          {/* Collector */}
          <motion.div
            className="absolute z-20"
            style={{ bottom: "30%" }}
            animate={{ left: `${collectorX}%` }}
            transition={{ duration: 2.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <CollectorFigure stage={collectorStage} />
          </motion.div>

          {/* Instruction */}
          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 4, duration: 1 }}
            className="absolute bottom-8 left-0 right-0 text-center z-30 font-body text-[9px] sm:text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "hsl(38 20% 40%)" }}
          >
            Tap a participant twice to swap their vial — avoid the patrols
          </motion.p>
        </div>
      )}

      {/* ── Win Screen ── */}
      {phase === "win" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="text-center max-w-lg">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
              className="font-display text-sm sm:text-base tracking-[0.2em] uppercase"
              style={{ color: "hsl(200 40% 70%)" }}>
              Seven of them will wake up. The Pantheon will not understand why.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
              className="mt-4 font-narrative italic text-xs sm:text-sm"
              style={{ color: "hsl(0 0% 50%)" }}>
              The ceremony's records will show ten successful ascensions.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5, duration: 0.8 }} className="mt-8">
              <p className="font-display text-[9px] tracking-[0.4em] uppercase" style={{ color: "hsl(38 50% 50%)" }}>
                ✦ Scroll 10 Recovered ✦
              </p>
            </motion.div>
            {firstWin && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.5, duration: 0.8 }} className="mt-6">
                <p className="font-narrative italic text-xs mb-2" style={{ color: "hsl(38 30% 55%)" }}>
                  A new entry has been added to the Bestiary.
                </p>
                <Link to="/bestiary"
                  className="font-body text-[9px] tracking-[0.3em] uppercase transition-colors"
                  style={{ color: "hsl(38 60% 50%)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "hsl(38 72% 60%)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "hsl(38 60% 50%)")}>
                  View the Bestiary →
                </Link>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5.5, duration: 0.6 }} className="mt-8">
              <button onClick={onClose}
                className="font-body text-[9px] tracking-[0.3em] uppercase border px-6 py-3 min-h-[44px] transition-colors"
                style={{ color: "hsl(38 30% 50%)", borderColor: "hsl(38 30% 30%)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "hsl(38 50% 50%)"; e.currentTarget.style.color = "hsl(38 60% 60%)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "hsl(38 30% 30%)"; e.currentTarget.style.color = "hsl(38 30% 50%)"; }}>
                Return to the Map
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* ── Lose Screen ── */}
      {phase === "lose" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="text-center max-w-lg">
            <p className="font-display text-sm sm:text-base tracking-[0.2em] uppercase"
              style={{ color: "hsl(0 40% 55%)" }}>
              {loseReason === "caught" ? "The harvest continues." : "The ceremony has begun. You were not fast enough."}
            </p>
            <p className="mt-4 font-narrative italic text-xs sm:text-sm" style={{ color: "hsl(0 0% 45%)" }}>
              {loseReason === "caught"
                ? "You were seen. The Collector has your record now."
                : "Ten vials. Ten ascensions. The records will show nothing unusual."}
            </p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.6 }} className="mt-8">
              <button onClick={resetGame}
                className="font-body text-[9px] tracking-[0.3em] uppercase border px-6 py-3 min-h-[44px] transition-colors"
                style={{ color: "hsl(38 30% 50%)", borderColor: "hsl(38 30% 30%)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "hsl(38 50% 50%)"; e.currentTarget.style.color = "hsl(38 60% 60%)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "hsl(38 30% 30%)"; e.currentTarget.style.color = "hsl(38 30% 50%)"; }}>
                Try Again
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// ── Trigger Panel ─────────────────────────────────────────────────────────────
export const VialSubstitutionTrigger = () => {
  const [showGame, setShowGame] = useState(false);

  return (
    <>
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
          onClick={() => setShowGame(true)}
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

      <AnimatePresence>
        {showGame && <VialSubstitutionGame onClose={() => setShowGame(false)} />}
      </AnimatePresence>
    </>
  );
};
