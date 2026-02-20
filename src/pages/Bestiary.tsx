import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { HiddenOrb } from "@/components/ChroniclesSystem";
import { DeadCorridors } from "@/components/DeadCorridors";

// ── Read unlock state from Chronicles localStorage ─────────────────────────────
// foundScrolls: updated scroll assignments
// Scroll 7 = Forbidden Transmission (World), 9 = Unmasked (Characters), 11 = Dead Corridors (Bestiary)
// Scroll 8 = Semper Review (Timeline, not yet built), 10 = Vial Substitution (Map, not yet built)
function getFoundScrolls(): number[] {
  try {
    const saved = localStorage.getItem("chronicles_game_state_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed.foundScrolls) ? parsed.foundScrolls : [];
    }
  } catch {}
  return [];
}

// ── Silhouettes — pure SVG, no external images ─────────────────────────────────

const UnmarkedSilhouette = () => (
  <svg viewBox="0 0 80 140" width="80" height="140" fill="none" aria-hidden="true">
    <ellipse cx="40" cy="22" rx="16" ry="18" fill="hsl(38 20% 18%)" />
    <path d="M24 40 Q20 80 18 140 L30 140 L33 90 L40 100 L47 90 L50 140 L62 140 Q60 80 56 40 Z" fill="hsl(38 15% 14%)" />
    <path d="M24 45 Q14 70 16 95 L22 92 Q20 70 28 52 Z" fill="hsl(38 15% 16%)" />
    <path d="M56 45 Q66 70 64 95 L58 92 Q60 70 52 52 Z" fill="hsl(38 15% 16%)" />
    <path d="M16 90 Q8 100 6 108 L14 110 Q16 103 22 96 Z" fill="hsl(38 15% 16%)" />
    <ellipse cx="8" cy="112" rx="5" ry="3" fill="hsl(38 10% 20%)" />
  </svg>
);

const SilencerSilhouette = () => (
  <svg viewBox="0 0 80 150" width="80" height="150" fill="none" aria-hidden="true">
    <ellipse cx="40" cy="20" rx="36" ry="8" fill="hsl(20 8% 12%)" />
    <rect x="22" y="10" width="36" height="18" rx="3" fill="hsl(20 8% 10%)" />
    <ellipse cx="40" cy="34" rx="12" ry="13" fill="hsl(20 6% 6%)" />
    <path d="M28 47 Q22 90 20 150 L30 150 L33 100 L40 108 L47 100 L50 150 L60 150 Q58 90 52 47 Z" fill="hsl(20 8% 9%)" />
    <path d="M28 47 Q40 58 52 47 L50 68 L40 72 L30 68 Z" fill="hsl(20 8% 12%)" />
    <path d="M28 50 Q18 80 17 115 L24 115 Q25 84 32 62 Z" fill="hsl(20 8% 10%)" />
    <path d="M52 50 Q62 80 63 115 L56 115 Q55 84 48 62 Z" fill="hsl(20 8% 10%)" />
  </svg>
);

const CollectorSilhouette = () => (
  <svg viewBox="0 0 80 150" width="80" height="150" fill="none" aria-hidden="true">
    <ellipse cx="40" cy="18" rx="14" ry="16" fill="hsl(38 10% 11%)" />
    <path d="M26 30 Q40 24 54 30 L52 42 L40 46 L28 42 Z" fill="hsl(38 10% 14%)" />
    <path d="M28 38 Q22 80 20 150 L30 150 L33 95 L40 104 L47 95 L50 150 L60 150 Q58 80 52 38 Z" fill="hsl(38 8% 10%)" />
    <path d="M28 40 Q16 72 14 108 L20 108 Q22 76 30 54 Z" fill="hsl(38 8% 12%)" />
    <path d="M52 40 Q64 72 66 108 L60 108 Q58 76 50 54 Z" fill="hsl(38 8% 12%)" />
    <rect x="13" y="95" width="7" height="14" rx="2" fill="hsl(38 65% 52%)" opacity="0.75" />
    <rect x="14" y="96" width="5" height="11" rx="1" fill="hsl(38 80% 72%)" opacity="0.45" />
  </svg>
);

const UnmaskedSilhouette = () => (
  <svg viewBox="0 0 80 140" width="80" height="140" fill="none" aria-hidden="true">
    <ellipse cx="40" cy="22" rx="16" ry="19" fill="hsl(38 15% 16%)" />
    <ellipse cx="40" cy="20" rx="14" ry="16" fill="hsl(38 10% 12%)" opacity="0.8" />
    <path d="M24 41 Q20 80 18 140 L30 140 L33 92 L40 102 L47 92 L50 140 L62 140 Q60 80 56 41 Z" fill="hsl(38 12% 13%)" />
    <path d="M24 46 Q15 70 17 95 L23 93 Q21 72 28 56 Z" fill="hsl(38 12% 14%)" />
    <path d="M56 46 Q65 70 63 95 L57 93 Q59 72 52 56 Z" fill="hsl(38 12% 14%)" />
    <ellipse cx="43" cy="23" rx="11" ry="13" fill="hsl(38 12% 9%)" opacity="0.5" />
  </svg>
);

const LostSilhouette = () => (
  <svg viewBox="0 0 80 140" width="80" height="140" fill="none" aria-hidden="true"
    style={{ filter: "blur(1.5px)", opacity: 0.7 }}>
    <ellipse cx="40" cy="18" rx="13" ry="14" fill="white" opacity="0.5" />
    <path d="M26 32 Q22 75 19 140 L30 140 L32 88 L40 98 L48 88 L50 140 L61 140 Q58 75 54 32 Z" fill="white" opacity="0.4" />
    <path d="M26 40 Q17 62 19 86 L25 83 Q23 63 30 48 Z" fill="white" opacity="0.35" />
    <path d="M54 40 Q63 62 61 86 L55 83 Q57 63 50 48 Z" fill="white" opacity="0.35" />
  </svg>
);

const UnnamedSilhouette = () => (
  <div className="flex items-center justify-center w-20 h-28">
    <span className="font-display text-5xl" style={{ color: "hsl(38 10% 20%)" }}>?</span>
  </div>
);

// ── Monster card data ──────────────────────────────────────────────────────────
interface MonsterDef {
  key: string;
  scrollId: number | null;
  name: string;
  displayName?: string;
  accentColor: string;
  origin: string;
  lore: string;
  lockedHint: string;
  firstEncountered: string;
  Silhouette: React.FC;
}

const MONSTERS: MonsterDef[] = [
  {
    key: "unmarked",
    scrollId: 11, // Dead Corridors on Bestiary page
    name: "The Unmarked",
    accentColor: "#b8960c",
    origin: "A soul too fractured to pass through Apotheosis. The body did not receive the message.",
    lore: "Sanctorium records show 214 incomplete Apotheosis events in the last century. Parliament records show zero. One of these is lying.",
    lockedHint: "Something waits in the dead world.",
    firstEncountered: "The Dead Corridors — Bestiary",
    Silhouette: UnmarkedSilhouette,
  },
  {
    key: "silencer",
    scrollId: 7, // Forbidden Transmission on World page
    name: "The Silencer",
    accentColor: "#6b6b6b",
    origin: "Selected young. Trained in isolation. Branded on the back of the neck so they cannot be identified in a crowd.",
    lore: "There are 7 known gaps in the official Panterra Timeline between the Great War and the present day. Historians who investigated 4 of them are no longer practicing. The other 3 investigators retired early, citing health reasons, within the same calendar month.",
    lockedHint: "The timeline hides more than it reveals.",
    firstEncountered: "Forbidden Transmission — World",
    Silhouette: SilencerSilhouette,
  },
  {
    key: "collector",
    scrollId: 10, // Vial Substitution on Map page (not yet built)
    name: "The Collector",
    accentColor: "#2d5a3d",
    origin: "Synthesized Intelligence given a single directive and enough time to optimize for it perfectly. Its directive is harvest.",
    lore: "The official record states that SI development was halted after the Great War by unanimous Parliament decree. The decree is dated six years after the first Collector was deployed.",
    lockedHint: "Something harvests inside the ceremony.",
    firstEncountered: "Vial Substitution — Map",
    Silhouette: CollectorSilhouette,
  },
  {
    key: "unmasked",
    scrollId: 9, // The Unmasked on Characters page
    name: "The Unmasked",
    accentColor: "#8b8b9b",
    origin: "The logical end of a society where a semper scar is the only proof of existence.",
    lore: "The semper scar is Panterra's only proof of identity. It can be replicated. Sanctorium has known this since the third year of the New Republic. The record of that discovery was sealed the same afternoon.",
    lockedHint: "Not everyone wearing a face is the person behind it.",
    firstEncountered: "The Unmasked — Characters",
    Silhouette: UnmaskedSilhouette,
  },
  {
    key: "lost",
    scrollId: 8, // Semper Review on Timeline page (not yet built)
    name: "The Lost",
    accentColor: "#c8d8e8",
    origin: "Someone who crossed the boundary of the mapped world without knowing where they were going. Not dead. Not alive. Just displaced.",
    lore: "The bio-warfare wasteland beyond Panterra's borders has been uninhabitable since the Great War. Expedition records from years 3, 7, and 12 of the New Republic describe figures moving in the dead zones. The expeditions were classified. The figures were not mentioned in the public summary.",
    lockedHint: "The record knows more than you do.",
    firstEncountered: "Semper Review — Timeline",
    Silhouette: LostSilhouette,
  },
];

// ── MonsterCard ────────────────────────────────────────────────────────────────
const MonsterCard = ({
  monster,
  unlocked,
  index,
}: {
  monster: MonsterDef;
  unlocked: boolean;
  index: number;
}) => {
  const { Silhouette, accentColor } = monster;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative border p-6 sm:p-8 flex flex-col sm:flex-row gap-6 transition-all duration-500"
      style={{
        borderColor: unlocked ? `${accentColor}55` : "hsl(38 10% 16%)",
        background:  unlocked ? "hsl(20 12% 8%)" : "hsl(20 10% 6%)",
        boxShadow:   unlocked ? `0 0 30px ${accentColor}18` : "none",
      }}
    >
      {unlocked && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{ background: accentColor, opacity: 0.6 }}
        />
      )}

      <div
        className="flex-shrink-0 flex items-center justify-center w-full sm:w-24 mx-auto sm:mx-0"
        style={{ minHeight: 100 }}
      >
        {unlocked ? (
          <Silhouette />
        ) : (
          <div
            className="w-16 h-24 border flex items-center justify-center"
            style={{ borderColor: "hsl(38 10% 18%)" }}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className="opacity-20">
              <rect x="2" y="8" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div>
          <p
            className="font-body text-[8px] tracking-[0.35em] uppercase mb-1"
            style={{ color: unlocked ? accentColor : "hsl(38 10% 28%)" }}
          >
            {unlocked ? `First encountered: ${monster.firstEncountered}` : "Locked Entry"}
          </p>
          <h3
            className="font-display text-xl tracking-[0.08em]"
            style={{ color: unlocked ? "hsl(38 25% 82%)" : "hsl(38 12% 38%)" }}
          >
            {monster.name}
          </h3>
        </div>

        <div
          className="text-[10px] tracking-[0.15em] uppercase font-body transition-all duration-700"
          style={{
            color:      unlocked ? `${accentColor}cc` : "transparent",
            filter:     unlocked ? "none" : "blur(4px)",
            userSelect: unlocked ? "text" : "none",
          }}
        >
          {monster.origin}
        </div>

        <div className="relative mt-1">
          <p
            className="font-narrative italic text-[0.9375rem] leading-[1.85] transition-all duration-700"
            style={{
              color:      unlocked ? "hsl(38 20% 68%)" : "hsl(38 10% 28%)",
              filter:     unlocked ? "none" : "blur(4px)",
              userSelect: unlocked ? "text" : "none",
            }}
          >
            {monster.lore}
          </p>
          {!unlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <p className="font-body text-[9px] tracking-[0.25em] uppercase text-muted-foreground/40">
                {monster.lockedHint}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── The Unnamed — permanently locked card ──────────────────────────────────────
const UnnamedCard = ({ allFiveUnlocked }: { allFiveUnlocked: boolean }) => {
  const [clickCount, setClickCount] = useState(0);
  const [scroll12Awarded, setScroll12Awarded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleClick = () => {
    if (scroll12Awarded) return;
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 3) {
      try {
        const saved = localStorage.getItem("chronicles_game_state_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (!parsed.foundScrolls?.includes(12)) {
            parsed.foundScrolls = [...(parsed.foundScrolls || []), 12];
            localStorage.setItem("chronicles_game_state_v2", JSON.stringify(parsed));
          }
        }
      } catch {}
      setScroll12Awarded(true);
      setShowOverlay(true);
      setTimeout(() => setShowOverlay(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      {allFiveUnlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4"
        >
          <p className="font-narrative italic text-[0.875rem] leading-[1.8]" style={{ color: "hsl(38 15% 40%)" }}>
            You have found everything Panterra will let you find. Something remains.
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
          >
            <p
              className="font-display text-lg sm:text-xl tracking-[0.1em] text-center px-8"
              style={{ color: "hsl(38 60% 50%)" }}
            >
              You kept looking. Most people don't.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        onClick={handleClick}
        className="border border-dashed p-6 sm:p-8 flex flex-col sm:flex-row gap-6 cursor-pointer transition-all duration-500"
        style={{
          borderColor: scroll12Awarded ? "hsl(38 40% 30% / 0.3)" : "hsl(38 8% 16%)",
          background: scroll12Awarded ? "hsl(20 10% 5%)" : "hsl(20 8% 4%)",
          boxShadow: scroll12Awarded
            ? "0 0 20px hsl(38 60% 40% / 0.08)"
            : "none",
          animation: !scroll12Awarded ? "unnamed-pulse 4s ease-in-out infinite" : "none",
        }}
      >
        <style>{`
          @keyframes unnamed-pulse {
            0%, 100% { border-color: hsl(38 8% 16%); }
            50% { border-color: hsl(38 20% 22%); }
          }
        `}</style>

        <div className="flex-shrink-0 flex items-center justify-center w-full sm:w-24 mx-auto sm:mx-0">
          <UnnamedSilhouette />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div>
            <p className="font-body text-[8px] tracking-[0.35em] uppercase mb-1" style={{ color: "hsl(38 8% 22%)" }}>
              Classification Unknown
            </p>
            <h3 className="font-display text-xl tracking-[0.08em]" style={{ color: "hsl(38 8% 30%)" }}>
              ? ? ? ? ? ? ? ?
            </h3>
          </div>
          <p className="font-narrative italic text-[0.9375rem] leading-[1.85]" style={{ color: "hsl(38 8% 28%)" }}>
            It has been seen in all four quadrants in the same week. It does not appear on any surveillance. Children describe it before they are old enough to have heard of it. The Pantheon has been petitioned for guidance. The Pantheon has not responded.
          </p>
          <p className="font-body text-[8px] tracking-[0.2em] uppercase mt-1" style={{ color: "hsl(38 6% 18%)" }}>
            ◈ Some things are not meant to be found.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Bestiary Page ─────────────────────────────────────────────────────────
const Bestiary = () => {
  const foundScrolls = getFoundScrolls();
  const allFiveUnlocked = [7, 8, 9, 10, 11].every((id) => foundScrolls.includes(id));
  const unmarkedUnlocked = foundScrolls.includes(11);

  return (
    <Layout>
      <div className="pt-24 pb-24 px-4 overflow-x-hidden">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 relative"
          >
            {/* Hidden Orb 3 — Bestiary page scroll */}
            <HiddenOrb id={3} className="absolute -right-1 top-0" />

            {/* Steampunk divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary/50">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" />
                <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1" />
                <path d="M10 2v4M10 14v4M2 10h4M14 10h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <h1
              className="font-display text-3xl sm:text-4xl tracking-[0.1em] mb-4"
              style={{ color: "hsl(38 72% 50%)" }}
            >
              The Bestiary of Panterra
            </h1>
            <p className="font-narrative italic text-[1.0625rem] sm:text-lg text-foreground/60 leading-[1.85] max-w-lg mx-auto">
              These are not creatures. They are consequences. Every one of them was made by the same system. Every one of them was someone once.
            </p>

            {/* Steampunk divider below subtitle */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="w-1.5 h-1.5 rotate-45 bg-primary/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
          </motion.div>

          {/* Monster Cards */}
          <div className="flex flex-col gap-6">
            {MONSTERS.map((monster, i) => {
              const unlocked = monster.scrollId !== null && foundScrolls.includes(monster.scrollId);
              return (
                <div key={monster.key}>
                  <MonsterCard
                    monster={monster}
                    unlocked={unlocked}
                    index={i}
                  />
                  {/* Dead Corridors game trigger near The Unmarked card */}
                  {monster.key === "unmarked" && !unmarkedUnlocked && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-center mt-3 mb-2"
                    >
                      <a
                        href="#dead-corridors"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("dead-corridors")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="font-body text-[9px] tracking-[0.3em] uppercase transition-colors"
                        style={{ color: "hsl(38 50% 40%)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(38 72% 55%)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(38 50% 40%)")}
                      >
                        ◈ The Unmarked have been sighted. Enter if you are prepared. ◈
                      </a>
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* The Unnamed */}
            <UnnamedCard allFiveUnlocked={allFiveUnlocked} />
          </div>

          {/* Footer navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-center mt-16"
          >
            <div className="steampunk-divider mb-8" />
            <Link
              to="/"
              className="font-body text-[9px] tracking-[0.3em] uppercase text-muted-foreground/30 hover:text-primary/60 transition-colors"
            >
              ← Return
            </Link>
          </motion.div>
        </div>

        {/* Dead Corridors game section */}
        <div id="dead-corridors">
          <DeadCorridors />
        </div>
      </div>
    </Layout>
  );
};

export default Bestiary;
