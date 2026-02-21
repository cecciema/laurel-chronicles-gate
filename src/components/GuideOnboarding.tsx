import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { guideCharacters, type GuideCharacter } from "@/data/world-data";
import { characterImageMap } from "@/data/guide-images";

// Resolve guide portrait: new guides use a full path string, legacy guides use a key in characterImageMap
const resolveGuideImage = (image: string): string =>
  image.startsWith("/") ? image : (characterImageMap[image] ?? image);

const welcomeMessages: Record<string, { title: string; body: string }> = {
  analytical: {
    title: "The data is incomplete. So is every map ever drawn of this world.",
    body: "You've chosen to see clearly. That comes with a cost - you will question things others accept. Welcome to Panterra. The truth is out there if you're willing to look past the doctrine.",
  },
  poetic: {
    title: "Every archive holds a word no one has read in centuries. You may be the first.",
    body: "Language is memory. You've arrived at a world full of both - some of it preserved, some of it deliberately buried. Let us begin with what is visible before we search for what is hidden.",
  },
  mysterious: {
    title: "Every institution in this world was built on a secret. Some were built to keep one.",
    body: "You've chosen wisely. The path is not obvious - but then, the most important truths never are. Observe everything. Trust nothing at face value. That is how you survive here.",
  },
  commanding: {
    title: "You are here because the planet needs you. That is not sentiment. It is fact.",
    body: "Resources are finite. Time is finite. Attention is the only thing you can choose where to direct. Choose carefully. The world's survival depends on those willing to accept that reality.",
  },
  divine: {
    title: "I have watched this civilization grow from its first fire. I will watch where yours leads.",
    body: "The system was designed to endure - not by force alone, but by belief. You are entering a world older than its own history knows. Some questions have answers. Some answers are best found slowly.",
  },
  raw: {
    title: "Everything they told you about this world is a version. I'll show you a different one.",
    body: "You want the real story? It's not in the archives or Parliament records. It's out here, on the edge of what they govern. Keep your eyes open. The institutions don't control everything - yet.",
  },
  ceremonial: {
    title: "Every great institution was built by those who chose continuity over comfort.",
    body: "You have entered through the proper door. That matters here. Sanctorium endures not because it is powerful — but because it is patient. I will show you how this world was written, and by whom.",
  },
  authoritative: {
    title: "This world does not run on philosophy. It runs on decision.",
    body: "Parliament did not build Panterra by asking permission. Every law, every boundary, every protected corridor was a choice made under pressure. You are about to learn how those choices were made - and at what cost.",
  },
  radiant: {
    title: "The ocean doesn't forgive hesitation. Neither does the mission.",
    body: "You've chosen a guide who works where the theory meets the water. The Magistry of Ocean isn't just science - it's survival. I'll show you what planetary restoration actually looks like from the field. Keep up.",
  },
  precise: {
    title: "I noticed you before you noticed me. That is how it always works.",
    body: "Insight is not about information — it is about timing. You have arrived at a world full of gatekeepers, and I know all of them. Follow carefully. The most important things happen in the spaces between the official story.",
  },
};

interface GuideOnboardingProps {
  onComplete: (guideId: string) => void;
}

const GUIDE_STORAGE_KEY = "lca_selected_guide";

// Fisher-Yates shuffle
function shuffleGuides(arr: GuideCharacter[]): GuideCharacter[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const GuideOnboarding = ({ onComplete }: GuideOnboardingProps) => {
  const [step, setStep] = useState<"welcome" | "choose" | "confirm" | "reveal">("welcome");
  const [shuffledGuides] = useState<GuideCharacter[]>(() => shuffleGuides(guideCharacters));
  const [selected, setSelected] = useState<GuideCharacter | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  const [revealedPosition, setRevealedPosition] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  // Scroll to top of the overlay container whenever the step changes
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  const handleSelect = (guide: GuideCharacter) => {
    setSelected(guide);
    setStep("confirm");
  };

  const handleCardClick = (guide: GuideCharacter) => {
    if (isTouch && tapped !== guide.id) {
      setTapped(guide.id);
      setRevealedPosition(guide.id);
    } else {
      setRevealedPosition(guide.id);
      handleSelect(guide);
    }
  };

  const handleConfirm = () => {
    if (!selected) return;
    setStep("reveal");
    setTimeout(() => {
      localStorage.setItem(GUIDE_STORAGE_KEY, selected.id);
      onComplete(selected.id);
    }, 9000);
  };

  const msg = selected ? welcomeMessages[selected.welcomeTone] : null;

  return (
    <div ref={scrollContainerRef} className="fixed inset-0 z-[100] bg-background overflow-y-auto overflow-x-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,hsl(var(--primary)/0.12),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-primary/40 rounded-full"
            style={{ left: `${8 + i * 8}%`, top: `${20 + (i % 4) * 20}%` }}
            animate={{ opacity: [0, 0.6, 0], y: [0, -30, -60] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* STEP 1: Welcome — vertically centred */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 1.2 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="text-center px-6 max-w-2xl mx-auto py-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1 }}
                className="font-display text-4xl sm:text-6xl tracking-[0.08em] text-foreground leading-tight"
              >
                LAUREL<br />
                <span className="text-brass-glow">CROWNS</span><br />
                ABOVE
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="mt-8 space-y-2"
              >
                <div className="steampunk-divider max-w-xs mx-auto" />
                <p className="font-narrative text-lg text-foreground/60 italic mt-6">
                  "You were given everything by the Republic, everything you could ever need..."
                </p>
                <p className="font-narrative text-lg text-foreground/60 italic">
                  "A life, a purpose, and Apotheosis... and yet, here you are."
                </p>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                onClick={() => setStep("choose")}
                className="mt-8 sm:mt-12 px-10 py-3 border border-primary/50 text-primary font-display text-sm tracking-[0.25em] uppercase hover:border-primary hover:shadow-glow transition-all"
              >
                Enter the World
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Choose Guide — top-aligned, naturally scrollable */}
        {step === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-16 pb-12"
          >
            <div className="text-center mb-10">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs tracking-[0.4em] text-primary/60 uppercase font-body mb-3"
              >
                A Choice Must Be Made
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-display text-2xl sm:text-4xl tracking-[0.08em] text-foreground"
              >
                Who Will Guide You Through This World?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 font-narrative text-base text-foreground/50 italic max-w-xl mx-auto"
              >
                Each Guide represents a different allegiance: Sanctorium, Parliament, Deep Forge, Convoy, and perhaps a hidden fifth... Your choice will shape the path ahead.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {shuffledGuides.map((guide, i) => (
                <motion.button
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  onClick={() => handleCardClick(guide)}
                  onMouseEnter={() => setHovered(guide.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative group aspect-[2/3] border border-border hover:border-primary/60 overflow-hidden transition-all duration-300 hover:shadow-glow"
                >
                  <img
                    src={resolveGuideImage(guide.image)}
                    alt={guide.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 char-portrait-normalize"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                  <AnimatePresence>
                    {(hovered === guide.id || tapped === guide.id) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/85 flex items-center justify-center p-3"
                      >
                        <p className="font-narrative text-xl sm:text-2xl text-foreground/80 italic text-center leading-relaxed">
                          "{guide.philosophy}"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-2">
                    <p className="font-display text-[11px] sm:text-[11px] tracking-wider text-foreground leading-tight">
                      {guide.name}
                    </p>
                    <p className="text-[9px] sm:text-[9px] tracking-wider text-primary uppercase font-body mt-0.5">
                      {guide.title}
                    </p>
                    <AnimatePresence>
                      {revealedPosition === guide.id && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="text-[9px] tracking-wider text-foreground/60 font-narrative italic mt-0.5"
                        >
                          {guide.magistry}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-[10px] tracking-[0.25em] text-muted-foreground uppercase font-body mt-8"
            >
              <span className="hidden sm:inline">Hover to reveal their philosophy · Click to choose</span>
              <span className="sm:hidden">Tap to preview · Tap again to choose</span>
            </motion.p>
          </motion.div>
        )}

        {/* STEP 3: Confirm — vertically centred */}
        {step === "confirm" && selected && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="max-w-lg mx-auto px-6 text-center py-12">
              <div className="relative w-28 h-40 sm:w-32 sm:h-48 mx-auto mb-6 sm:mb-8">
                <img
                  src={resolveGuideImage(selected.image)}
                  alt={selected.name}
                  className="w-full h-full object-cover border border-primary/40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>

              <p className="text-[10px] tracking-[0.4em] text-primary uppercase font-body mb-2">
                {selected.magistry}
              </p>
              <h3 className="font-display text-2xl tracking-wide text-foreground">
                {selected.name}
              </h3>
              <div className="steampunk-divider max-w-xs mx-auto my-6" />
              <p className="font-narrative text-base text-foreground/70 italic leading-relaxed mb-8">
                "{selected.philosophy}"
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleConfirm}
                  className="px-8 py-3 bg-primary text-primary-foreground font-display text-sm tracking-[0.2em] uppercase hover:shadow-glow transition-shadow"
                >
                  Choose This Guide
                </button>
                <button
                  onClick={() => { setSelected(null); setStep("choose"); }}
                  className="px-8 py-3 border border-border text-muted-foreground font-display text-sm tracking-[0.2em] uppercase hover:border-primary/40 transition-colors"
                >
                  Return
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Reveal — vertically centred */}
        {step === "reveal" && selected && msg && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="max-w-2xl mx-auto px-6 text-center py-12">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[10px] tracking-[0.5em] text-primary/60 uppercase font-body mb-6"
              >
                {selected.name} · {selected.magistry}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.9 }}
                className="font-display text-xl sm:text-2xl tracking-wide text-foreground leading-relaxed mb-8"
              >
                "{msg.title}"
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="steampunk-divider max-w-xs mx-auto"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="mt-8 font-narrative text-base text-foreground/70 italic leading-relaxed"
              >
                {msg.body}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.5 }}
                className="mt-10 text-xs tracking-[0.3em] text-muted-foreground uppercase font-body"
              >
                Entering the world…
              </motion.p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export { GUIDE_STORAGE_KEY };
export default GuideOnboarding;
