import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { HiddenOrb, useGame } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import { factions } from "@/data/world-data";

// ─── Collector SVG silhouette ─────────────────────────────────────────────────
const CollectorFigure = ({ step }: { step: number }) => {
  // step 0..3 — moves from right edge toward center
  const rightPct = Math.max(2, 86 - step * 26);
  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-10 flex items-end"
      style={{
        right: `${rightPct}%`,
        transition: "right 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <motion.div
        animate={{ opacity: step > 0 ? [0.6, 0.85, 0.6] : 0.4 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="34"
          height="118"
          viewBox="0 0 34 118"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Devotee hood / head */}
          <ellipse cx="17" cy="13" rx="8" ry="10" fill="hsl(38 10% 12%)" />
          {/* Collar flare — wrong side buttons, collar too high */}
          <path d="M10 23 Q17 18 24 23 L22 30 L17 32 L12 30 Z" fill="hsl(38 10% 15%)" />
          {/* Long robe body — slightly too narrow at shoulders */}
          <path
            d="M12 28 Q8 52 7 95 L10 95 L12 65 L17 68 L22 65 L24 95 L27 95 Q26 52 22 28 Z"
            fill="hsl(38 8% 11%)"
          />
          {/* Sleeves too long — hands hidden */}
          <path d="M12 30 Q5 52 4 78 L8 78 Q9 55 13 38 Z" fill="hsl(38 8% 13%)" />
          <path d="M22 30 Q29 52 30 78 L26 78 Q25 55 21 38 Z" fill="hsl(38 8% 13%)" />
          {/* Vial glow at belt — left side (wrong side) */}
          <rect x="5" y="68" width="4" height="9" rx="1" fill="hsl(38 70% 55%)" opacity="0.7" />
          <rect x="5.5" y="69" width="3" height="7" rx="0.5" fill="hsl(38 80% 75%)" opacity="0.4" />
          {/* Feet */}
          <path d="M10 95 L9 105 L13 105 L14 95" fill="hsl(38 8% 10%)" />
          <path d="M24 95 L23 105 L21 105 L20 95" fill="hsl(38 8% 10%)" />
        </svg>
      </motion.div>
    </div>
  );
};

// ─── Branch Data ──────────────────────────────────────────────────────────────
// Correct path: A → B → B → C → A (wins)
// Any wrong choice adds a warning; second wrong triggers Collector

interface Beat {
  id: number;
  situation: string;
  warning?: string; // shown after first wrong choice at this beat
  choices: { label: string; correct: boolean }[];
}

const BEATS: Beat[] = [
  {
    id: 1,
    situation:
      "You receive your Apotheosis summons. The paper is warm — they are always warm. You have three days. You look at the date stamp and notice it was issued yesterday, but delivered today. That means someone held it.",
    choices: [
      { label: "Go willingly. You have prepared for this.", correct: true },
      { label: "Investigate who held the letter before you.", correct: false },
      { label: "Try to delay. You need more time to think.", correct: false },
    ],
  },
  {
    id: 2,
    situation:
      "At the ceremony gates a Pantheon Devotee in a pale robe extends his hand for your semper scan. The scanner light is green. But the buttons on his robe are on the wrong side — every Devotee's are on the right. His are on the left.",
    warning:
      "Something is following you. The air has changed. Choose carefully.",
    choices: [
      { label: "Comply with the scan without acknowledging the buttons.", correct: false },
      {
        label:
          "Ask a quiet question — compliment the ceremony, let him speak first.",
        correct: true,
      },
      {
        label: "Point out the wrong buttons directly.",
        correct: false,
      },
    ],
  },
  {
    id: 3,
    situation:
      "Inside the chamber the crowd is given small cups — the ceremony drink. Everyone lifts theirs. Around you, faces change after the first sip. Not pain. Something else. Like something leaving.",
    choices: [
      { label: "Drink. You don't want to stand out.", correct: false },
      {
        label:
          "Pretend to drink — tilt the cup to your lips and let nothing pass.",
        correct: true,
      },
      { label: "Watch the others carefully before deciding.", correct: false },
    ],
  },
  {
    id: 4,
    situation:
      "After the ceremony, soldiers enter in formation. They move between the rows. People who finished their cups are guided — gently, with a hand on the elbow — toward a separate door. Nobody resists. Nobody looks afraid. That is the thing that frightens you.",
    warning: "Something is following you. The air has changed. Choose carefully.",
    choices: [
      { label: "Hide behind the crowd and stay very still.", correct: false },
      { label: "Run for the nearest exit.", correct: false },
      {
        label:
          "Stand still and let the soldiers pass. Do not make eye contact.",
        correct: true,
      },
    ],
  },
  {
    id: 5,
    situation:
      "When the soldiers leave, a door appears in the east wall. It was not there before. The stone around it is warm. It opens inward. Beyond it you can see a corridor that leads somewhere the chamber does not account for.",
    choices: [
      { label: "Go through. Whatever is beyond it wanted you to find it.", correct: true },
      { label: "Wait — it could be a test.", correct: false },
      { label: "Call out to see if anyone else sees it.", correct: false },
    ],
  },
];

const SCROLL_ID = 8;

// ─── Apotheosis Path Component ────────────────────────────────────────────────
const ApotheosisPath = () => {
  const { foundScrolls, foundScroll } = useGame();

  const alreadyWon = foundScrolls.includes(SCROLL_ID);

  type Phase = "playing" | "won" | "caught" | "blackout";

  const [beatIndex, setBeatIndex]       = useState(0);
  const [wrongCount, setWrongCount]     = useState(0);
  const [warningShown, setWarningShown] = useState(false);
  const [showWarning, setShowWarning]   = useState(false);
  const [phase, setPhase]               = useState<Phase>("playing");
  const [bestiaryUnlocked, setBestiaryUnlocked] = useState(alreadyWon);
  const [collectorStep, setCollectorStep] = useState(0);

  // Reset everything
  const handleRestart = () => {
    setBeatIndex(0);
    setWrongCount(0);
    setWarningShown(false);
    setShowWarning(false);
    setPhase("playing");
    setCollectorStep(0);
  };

  const handleChoice = (correct: boolean) => {
    if (phase !== "playing") return;

    const beat = BEATS[beatIndex];

    if (correct) {
      setShowWarning(false);
      if (beatIndex === BEATS.length - 1) {
        // Won
        setPhase("won");
        setBestiaryUnlocked(true);
        if (!alreadyWon) foundScroll(SCROLL_ID);
      } else {
        setBeatIndex((i) => i + 1);
      }
    } else {
      // Wrong choice
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      const newStep = Math.min(collectorStep + 1, 3);
      setCollectorStep(newStep);

      const hasWarning = !!beat.warning;

      if (newStep >= 3) {
        // Caught
        setPhase("blackout");
        setTimeout(() => setPhase("caught"), 2800);
      } else if (hasWarning && !warningShown) {
        // First warning at this beat
        setWarningShown(true);
        setShowWarning(true);
      } else {
        // No warning or already warned — just darken atmosphere and stay on beat
        setShowWarning(false);
      }
    }
  };

  const beat = BEATS[beatIndex];
  // Atmosphere intensity grows with wrong count
  const atmosphereDark = Math.min(wrongCount * 0.08, 0.32);
  const textColor = wrongCount === 0 ? "hsl(38 30% 75%)" : wrongCount === 1 ? "hsl(38 25% 68%)" : "hsl(38 20% 55%)";

  return (
    <section className="mt-24 mb-12">
      {/* ── Divider ── */}
      <div className="max-w-2xl mx-auto px-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-primary/20" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-1.5 h-1.5 rotate-45 bg-primary/60" />
            <div className="w-2.5 h-2.5 rotate-45 border border-primary/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-primary/60" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/40 to-primary/20" />
        </div>
      </div>

      {/* ── Header ── */}
      <div className="max-w-2xl mx-auto px-4 text-center mb-6">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl tracking-[0.15em] text-primary mb-4"
        >
          The Apotheosis Path
        </motion.h2>
        <p className="font-narrative italic text-[0.9375rem] text-foreground/60 leading-[1.9] max-w-lg mx-auto">
          "You have received your Apotheosis summons. Every citizen faces this moment. Every choice you make from here determines what you become — and what finds you in the dark."
        </p>
      </div>

      {/* ── Game container ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="max-w-2xl mx-auto px-4"
      >
        <div
          className="relative border border-border bg-card overflow-hidden"
          style={{
            background: `linear-gradient(to bottom, hsl(26 15% 5%), hsl(26 10% ${4 + atmosphereDark * 100}%))`,
            minHeight: 340,
          }}
        >
          {/* ── Blackout overlay ── */}
          <AnimatePresence>
            {phase === "blackout" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 z-50 flex items-center justify-center"
                style={{ background: "hsl(26 10% 4%)" }}
              >
                {/* Vial icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.1, 1.05, 0.9] }}
                  transition={{ duration: 2.5, times: [0, 0.3, 0.7, 1] }}
                  className="flex flex-col items-center gap-3"
                >
                  <svg width="36" height="72" viewBox="0 0 36 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="13" y="2" width="10" height="6" rx="1" fill="hsl(38 40% 40%)" />
                    <rect x="11" y="7" width="14" height="4" rx="1" fill="hsl(38 40% 35%)" />
                    <path d="M11 11 Q8 25 7 50 Q7 66 18 68 Q29 66 29 50 Q28 25 25 11 Z" fill="hsl(38 15% 14%)" stroke="hsl(38 35% 35%)" strokeWidth="1" />
                    <motion.ellipse
                      cx="18" cy="58" rx="7" ry="6"
                      fill="hsl(38 80% 65%)"
                      opacity="0.5"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </svg>
                  <p className="font-display text-[10px] tracking-[0.3em] uppercase text-primary/50">
                    Soul Collected
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Caught screen ── */}
          <AnimatePresence>
            {phase === "caught" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 p-8 text-center"
                style={{ background: "hsl(26 10% 4% / 0.97)" }}
              >
                <p className="font-display text-[10px] tracking-[0.3em] uppercase text-destructive">
                  Soul Collected
                </p>
                <p className="font-narrative italic text-foreground/60 text-[0.9375rem] leading-[1.85] max-w-sm">
                  The Collector has found you at your apex. The vial is no longer empty. There is no record of your soul.
                </p>
                <button
                  onClick={handleRestart}
                  className="px-8 py-3 border border-primary text-primary font-body text-[10px] tracking-widest uppercase hover:bg-primary/10 transition-colors min-h-[44px]"
                >
                  Try Again
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
                className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 p-8 text-center"
                style={{ background: "hsl(26 10% 4% / 0.94)" }}
              >
                <div className="w-10 h-px bg-primary/40" />
                <p className="font-display text-[10px] tracking-[0.3em] uppercase text-primary">
                  Path Complete
                </p>
                <p className="font-narrative italic text-foreground/70 text-[0.9375rem] leading-[1.85] max-w-sm">
                  You walked the Apotheosis Path and came out the other side. Not everyone does. Arborwell has been marked on your map.
                </p>
                <div className="w-10 h-px bg-primary/20" />
                <button
                  onClick={handleRestart}
                  className="px-8 py-3 border border-border text-muted-foreground font-body text-[10px] tracking-widest uppercase hover:border-primary/40 hover:text-primary transition-colors min-h-[44px]"
                >
                  Walk Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Playing state ── */}
          <div className="p-5 sm:p-7 flex flex-col gap-5">
            {/* Progress indicators */}
            <div className="flex items-center gap-1.5">
              {BEATS.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 transition-all duration-500"
                  style={{
                    background:
                      i < beatIndex
                        ? "hsl(38 60% 50%)"
                        : i === beatIndex
                        ? "hsl(38 60% 50% / 0.5)"
                        : "hsl(38 20% 20%)",
                  }}
                />
              ))}
              <span className="font-body text-[8px] tracking-[0.25em] text-muted-foreground/40 ml-1 uppercase flex-shrink-0">
                {beatIndex + 1}/{BEATS.length}
              </span>
            </div>

            {/* Collector arena */}
            <div
              className="relative border border-border/30 bg-background/20 overflow-hidden"
              style={{ height: 100 }}
            >
              {/* Ground */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-border/20" />
              {/* Label */}
              <p className="absolute top-2 left-3 font-body text-[7px] tracking-[0.3em] text-muted-foreground/25 uppercase pointer-events-none">
                The Collector
              </p>
              <CollectorFigure step={collectorStep} />
            </div>

            {/* Warning banner */}
            <AnimatePresence>
              {showWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="border border-destructive/40 bg-destructive/8 px-4 py-2.5"
                >
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-destructive text-center">
                    ⚠ Something is following you. The air has changed. Choose carefully.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Beat narrative */}
            <AnimatePresence mode="wait">
              <motion.div
                key={beatIndex + "-" + wrongCount}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-5"
              >
                <p
                  className="font-narrative italic text-[1rem] leading-[1.9]"
                  style={{ color: textColor }}
                >
                  {beat.situation}
                </p>

                {/* Choices */}
                <div className="flex flex-col gap-2.5">
                  {beat.choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => handleChoice(choice.correct)}
                      className="w-full text-left px-4 py-3 border font-body text-[0.8125rem] leading-[1.6] tracking-wide transition-all duration-200 hover:bg-primary/8 hover:border-primary/50 hover:text-foreground active:scale-[0.99] min-h-[44px]"
                      style={{
                        borderColor: "hsl(38 20% 22%)",
                        color: "hsl(38 20% 58%)",
                      }}
                    >
                      <span className="font-display text-[8px] tracking-[0.2em] text-primary/40 mr-2 uppercase">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {choice.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Bestiary cards ── */}
      <div className="max-w-2xl mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* The Collector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-border bg-card p-5 flex gap-4"
        >
          <div
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center border"
            style={{ borderColor: "hsl(38 30% 22%)" }}
          >
            {bestiaryUnlocked
              ? <span className="text-primary text-lg">◈</span>
              : <span className="text-muted-foreground/30 text-lg">🔒</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[8px] tracking-[0.25em] uppercase text-primary/50 mb-0.5">
              Bestiary · Apotheosis Entity
            </p>
            <p className="font-display text-[0.9375rem] tracking-wide text-foreground mb-2">
              The Collector
            </p>
            <p
              className="font-narrative italic text-[0.8125rem] leading-[1.75] text-foreground/70 transition-all duration-500"
              style={{
                filter: bestiaryUnlocked ? "none" : "blur(4px)",
                userSelect: bestiaryUnlocked ? "auto" : "none",
              }}
            >
              {bestiaryUnlocked
                ? "The official record states that SI development was halted after the Great War by unanimous Parliament decree. The decree is dated six years after the first Collector was deployed."
                : "WALK THE APOTHEOSIS PATH TO UNLOCK · Unlock description by completing the game · Hidden text is concealed until discovery"}
            </p>
            {!bestiaryUnlocked && (
              <p className="font-body text-[8px] tracking-[0.2em] uppercase text-muted-foreground/30 mt-2">
                Walk the Path to Unlock
              </p>
            )}
          </div>
        </motion.div>

        {/* The Unnamed — permanent mystery */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="border p-5 flex gap-4"
          style={{
            borderColor: "hsl(38 10% 14%)",
            background: "hsl(26 15% 4%)",
          }}
        >
          <div
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-dashed"
            style={{ borderColor: "hsl(38 10% 18%)" }}
          >
            <span className="font-display text-lg text-muted-foreground/20">?</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[8px] tracking-[0.25em] uppercase mb-0.5" style={{ color: "hsl(38 10% 30%)" }}>
              Bestiary · Classification Unknown
            </p>
            <p className="font-display text-[0.9375rem] tracking-wide mb-2" style={{ color: "hsl(38 10% 35%)" }}>
              ░░░ The Unnamed ░░░
            </p>
            <p className="font-narrative italic text-[0.8125rem] leading-[1.75]" style={{ color: "hsl(38 10% 32%)" }}>
              It has been seen in all four quadrants in the same week. It does not appear on any surveillance. Children describe it before they are old enough to have heard of it. The Pantheon has been petitioned for guidance. The Pantheon has not responded.
            </p>
            <p className="font-body text-[8px] tracking-[0.2em] uppercase mt-2" style={{ color: "hsl(38 10% 22%)" }}>
              ◈ This record does not unlock
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

// ─── Factions Page ────────────────────────────────────────────────────────────
const Factions = () => {
  const [expanded, setExpanded] = useState<string | null>("crown");

  return (
    <Layout>
      <div className="pt-24 pb-20 px-4 overflow-x-hidden">
        <SectionHeader
          title="Factions & Powers"
          subtitle="Five forces locked in a struggle that will determine the empire's future"
        />

        <div className="max-w-4xl mx-auto space-y-4">
          {factions.map((faction) => (
            <motion.div
              key={faction.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === faction.id ? null : faction.id)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-secondary/30 transition-colors min-h-[64px]"
              >
                <div className="flex-1 pr-4">
                  <h3 className="font-display text-[1.0625rem] sm:text-lg tracking-wide text-foreground">
                    {faction.name}
                  </h3>
                  <p className="font-narrative text-sm text-primary italic mt-1 leading-[1.6]">
                    "{faction.motto}"
                  </p>
                </div>
                <span className="text-muted-foreground text-xl font-body flex-shrink-0 w-8 text-center">
                  {expanded === faction.id ? "−" : "+"}
                </span>
              </button>

              <AnimatePresence>
                {expanded === faction.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-6 space-y-4 relative">
                      <div className="steampunk-divider" />
                      {/* Hidden Orb 5 — tucked beside the divider, only first faction */}
                      {faction.id === "crown" && (
                        <HiddenOrb id={5} className="absolute top-4 right-2" />
                      )}
                      <p className="text-[0.9375rem] sm:text-sm text-foreground/70 font-body leading-[1.8]">
                        {faction.description}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div>
                          <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-1">
                            Leader
                          </h4>
                          <p className="text-[0.9375rem] sm:text-sm text-foreground font-body">{faction.leader}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-1">
                            Strength
                          </h4>
                          <p className="text-[0.9375rem] sm:text-sm text-foreground/70 font-body">{faction.strength}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-1">
                            Ideology
                          </h4>
                          <p className="text-[0.9375rem] sm:text-sm text-foreground/70 font-narrative italic leading-[1.8]">{faction.ideology}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* ── Apotheosis Path game ── */}
        <ApotheosisPath />

      </div>
    </Layout>
  );
};

export default Factions;
