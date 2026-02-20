import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Scroll, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// ── Game win scroll IDs (7–11) ────────────────────────────────────────────────
const GAME_SCROLL_IDS = [7, 8, 9, 10, 11];
const BESTIARY_COMPLETE_KEY = "bestiary-complete-seen";

// ── Scroll data ────────────────────────────────────────────────────────────────
const SCROLLS = [
  {
    id: 1,
    title: "The Southern Burn",
    hint: "Hidden somewhere in the world",
    text: "The southern hemisphere was not destroyed by war. The burn was controlled. Someone needed it empty.",
    source: "World page orb",
    type: "discoverable" as const,
  },
  {
    id: 2,
    title: "The Convoy's Origin",
    hint: "Hidden somewhere in the world",
    text: "The Convoy's first recorded communication predates the Great War by 40 years. They did not form in response to the system. They built it.",
    source: "Timeline page orb",
    type: "discoverable" as const,
  },
  {
    id: 3,
    title: "The Apotheosis Data",
    hint: "Hidden somewhere in the world",
    text: "Apotheosis yields are tracked by quadrant, by season, and by soul mass. The data is sent somewhere. The destination is not listed in any Parliament record.",
    source: "Bestiary page orb",
    type: "discoverable" as const,
  },
  {
    id: 4,
    title: "The Placed Ones",
    hint: "Hidden somewhere in the world",
    text: "Not all Sol Deus are born. Some are placed. The selection criteria have never been made public. The criteria exist.",
    source: "Characters page orb",
    type: "discoverable" as const,
  },
  {
    id: 5,
    title: "The Boundary Signal",
    hint: "Hidden somewhere in the world",
    text: "The satellites do not only herd the moon. They also maintain a boundary. Inside the boundary, signals cannot leave. Outside the boundary, one location is always excluded from surveillance.",
    source: "Map page orb",
    type: "discoverable" as const,
  },
  {
    id: 6,
    title: "The Excluded Place",
    hint: "Hidden somewhere in the world",
    text: "The excluded location has a name. It was removed from all maps after the Great War. It was not destroyed. It was protected.",
    source: "Enter page easter egg glyph",
    type: "discoverable" as const,
  },
  {
    id: 7,
    title: "The Embedded Operatives",
    hint: "Complete a game to unlock",
    text: "Three Convoy operatives were embedded in the Parliament Science Division at the time of the meteor discovery. Their names appear in the attendance records. Their employment history does not exist.",
    source: "Win Forbidden Transmission — World page",
    type: "earned" as const,
  },
  {
    id: 8,
    title: "The Semper Record",
    hint: "Complete a game to unlock",
    text: "The semper review process has been compromised since Year 12 of the New Republic. The review board knows. They have always known.",
    source: "Win Semper Review — Timeline page",
    type: "earned" as const,
  },
  {
    id: 9,
    title: "The Erased Constellations",
    hint: "Complete a game to unlock",
    text: "There are 14 Sol Deus positions across Panterra's history. Only 11 constellations are publicly recognized. The other 3 have been erased from all star charts produced after the Great War.",
    source: "Win The Unmasked — Characters page",
    type: "earned" as const,
  },
  {
    id: 10,
    title: "The Optimized Yield",
    hint: "Complete a game to unlock",
    text: "The soul mass collected at peak Apotheosis events is 40 percent higher than at standard events. Someone is timing the ceremonies. Someone is optimizing the yield.",
    source: "Win Vial Substitution — Map page (coming soon)",
    type: "earned" as const,
  },
  {
    id: 11,
    title: "The Unmarked Ratio",
    hint: "Complete a game to unlock",
    text: "The Unmarked are not accidents. The ratio of incomplete Apotheosis events has remained statistically constant for 60 years. Constant ratios do not happen by chance.",
    source: "Win Dead Corridors — Bestiary page",
    type: "earned" as const,
  },
  {
    id: 12,
    title: "The Remembered Place",
    hint: "This one was never meant to be found",
    text: "You kept looking at the thing that was never meant to be found. That says everything about you. Valorica is not a place that was built. It is a place that was remembered.",
    source: "The Unnamed — Bestiary",
    type: "secret" as const,
  },
];

const TOTAL_SCROLLS = SCROLLS.length;

// ── Sealed document correct order ─────────────────────────────────────────────
const CORRECT_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// ── Allegiance Quiz Data ───────────────────────────────────────────────────
type AllegianceId = "sanctorium" | "parliament" | "deepforge" | "convoy" | "unseen";

interface AllegianceQuestion {
  id: string;
  question: string;
  answers: { text: string; allegiance: Exclude<AllegianceId, "unseen"> }[];
}

const ALLEGIANCE_QUESTIONS_SHUFFLEABLE: AllegianceQuestion[] = [
  {
    id: "A",
    question: "You were born in Panterra. You have never questioned this. Then one day you find a document that suggests the world you were shown is not the whole world. What do you do?",
    answers: [
      { text: "Put it back. The world you were shown has kept you alive.", allegiance: "sanctorium" },
      { text: "Report it to the appropriate authority. If it matters, someone above you should know.", allegiance: "parliament" },
      { text: "Show it to the people in your community. If it affects the world it affects them too.", allegiance: "deepforge" },
      { text: "Keep it. Add it to everything else you have quietly noticed.", allegiance: "convoy" },
    ],
  },
  {
    id: "B",
    question: "The Apotheosis ceremony is approaching for someone you love. They are afraid. What do you tell them?",
    answers: [
      { text: "That the ceremony is sacred and their fear is part of the passage.", allegiance: "sanctorium" },
      { text: "That the system has functioned for generations and the odds are in their favor.", allegiance: "parliament" },
      { text: "That you will be outside waiting and you will not leave until they come back out.", allegiance: "deepforge" },
      { text: "That they do not have to go. That there are other ways.", allegiance: "convoy" },
    ],
  },
  {
    id: "C",
    question: "A Sol Deus offers you a position inside the Sanctorium. It is more than you expected. What is your first feeling?",
    answers: [
      { text: "Gratitude. This is what devotion is for.", allegiance: "sanctorium" },
      { text: "Calculation. What do they need from you and is it worth giving.", allegiance: "parliament" },
      { text: "Suspicion. People from where you come from do not get offered things without a cost.", allegiance: "deepforge" },
      { text: "Certainty that this is a trap of some kind.", allegiance: "convoy" },
    ],
  },
  {
    id: "D",
    question: "The Parliament passes a new directive that limits movement between quadrants. How do you respond?",
    answers: [
      { text: "You comply. Order is sacred even when it is inconvenient.", allegiance: "sanctorium" },
      { text: "You study the directive carefully and find the exceptions written into it.", allegiance: "parliament" },
      { text: "You find out which communities are most affected and you help them navigate it.", allegiance: "deepforge" },
      { text: "You ignore it. You have never needed their permission and you do not intend to start now.", allegiance: "convoy" },
    ],
  },
  {
    id: "E",
    question: "You discover that someone in your community has been falsifying their semper record. What do you do?",
    answers: [
      { text: "Report it. The semper record is the foundation of everything.", allegiance: "sanctorium" },
      { text: "Understand why first. Then decide whether it serves anyone to report it.", allegiance: "parliament" },
      { text: "Ask them what they needed to survive that required this. Then help them.", allegiance: "deepforge" },
      { text: "Help them do it better so they do not get caught.", allegiance: "convoy" },
    ],
  },
  {
    id: "F",
    question: "The meteor is real and it is coming. You have been told privately. You have one hour before the announcement. What do you do with that hour?",
    answers: [
      { text: "Pray. If this is the end you want to face it as you have lived.", allegiance: "sanctorium" },
      { text: "Make three communications that will matter regardless of what happens next.", allegiance: "parliament" },
      { text: "Go to the people you love and stay with them until the announcement comes.", allegiance: "deepforge" },
      { text: "Use the hour to access something that will only be accessible while everyone else is unprepared.", allegiance: "convoy" },
    ],
  },
  {
    id: "G",
    question: "You are given the choice to leave Panterra's mapped world entirely. No one will know. You can never come back. Do you go?",
    answers: [
      { text: "No. Everything that matters to you is here.", allegiance: "sanctorium" },
      { text: "No. You are more useful inside the system than outside it.", allegiance: "parliament" },
      { text: "No. The people you are responsible for are here.", allegiance: "deepforge" },
      { text: "Yes. Without hesitation.", allegiance: "convoy" },
    ],
  },
];

const ALLEGIANCE_QUESTION_FINAL: AllegianceQuestion = {
  id: "8",
  question: "At the end of everything, what do you want to have been?",
  answers: [
    { text: "Faithful. To the ceremony, to the order, to the thing that held the world together.", allegiance: "sanctorium" },
    { text: "Effective. The person who understood the system well enough to actually change it.", allegiance: "parliament" },
    { text: "Present. There for the people who needed someone to show up.", allegiance: "deepforge" },
    { text: "Awake. The one who refused to accept the version of reality they were handed.", allegiance: "convoy" },
  ],
};

const ALLEGIANCE_DATA: Record<AllegianceId, {
  name: string;
  text: string;
  storageKey: string;
  scrollAward?: number;
}> = {
  sanctorium: {
    name: "The Sanctorium",
    text: "You are The Sanctorium. You have always understood that faith is not the absence of doubt — it is the decision to act anyway. The Pantheon was built for people like you. Whether it deserves you is a different question.",
    storageKey: "allegiance-scroll-7-awarded",
    scrollAward: 7,
  },
  parliament: {
    name: "The Parliament",
    text: "You are The Parliament. You have always known that the most dangerous place to stand is outside a system you do not understand. You prefer to be inside. You prefer to be useful. You prefer to be the reason things did not fall apart.",
    storageKey: "parliament-intelligence-unlocked",
  },
  deepforge: {
    name: "The Deep Forge",
    text: "You are The Deep Forge. You were never given the things the others were given and you built your life anyway. The institutions of Panterra were not made for you. That has never stopped you and it never will.",
    storageKey: "deepforge-survival-unlocked",
  },
  convoy: {
    name: "The Convoy Rebellion",
    text: "You are The Convoy Rebellion. You stopped trusting the version of the world they handed you a long time ago. You are not certain what the truth is. You are certain it is not what you were told.",
    storageKey: "convoy-message-unlocked",
  },
  unseen: {
    name: "The Unseen",
    text: "You do not belong to any of them — not fully, not finally. This is not indecision. This is something rarer. There are people who live outside everything Panterra maps and measures. You would recognize them if you met them. You might already be one.",
    storageKey: "arborwell-hint-unlocked",
  },
};

// Fisher-Yates helper
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuizQuestions(): AllegianceQuestion[] {
  const shuffled = shuffleArray(ALLEGIANCE_QUESTIONS_SHUFFLEABLE).map(q => ({
    ...q,
    answers: shuffleArray(q.answers),
  }));
  return [...shuffled, { ...ALLEGIANCE_QUESTION_FINAL, answers: shuffleArray(ALLEGIANCE_QUESTION_FINAL.answers) }];
}

function resolveAllegiance(scores: Record<Exclude<AllegianceId, "unseen">, number>, lastAnswer: Exclude<AllegianceId, "unseen">): AllegianceId {
  const vals = Object.values(scores);
  if (vals.every(v => v === 2)) return "unseen";
  const max = Math.max(...vals);
  const tied = (Object.keys(scores) as Exclude<AllegianceId, "unseen">[]).filter(k => scores[k] === max);
  if (tied.length === 1) return tied[0];
  if (tied.includes(lastAnswer)) return lastAnswer;
  const priority: Exclude<AllegianceId, "unseen">[] = ["convoy", "deepforge", "parliament", "sanctorium"];
  for (const p of priority) { if (tied.includes(p)) return p; }
  return tied[0];
}

const AllegianceSymbol = ({ allegiance }: { allegiance: AllegianceId }) => {
  const color = "hsl(38 72% 55%)";
  switch (allegiance) {
    case "sanctorium":
      return (<svg width="60" height="80" viewBox="0 0 60 80" fill="none"><path d="M30 8 L30 72" stroke={color} strokeWidth="2.5" /><path d="M22 16 Q30 4 38 16" stroke={color} strokeWidth="2" fill="none" /><path d="M24 12 Q30 0 36 12" stroke={color} strokeWidth="1.5" fill="none" /><ellipse cx="30" cy="20" rx="6" ry="8" fill={color} opacity="0.3" /><ellipse cx="30" cy="16" rx="3" ry="5" fill={color} opacity="0.5" /></svg>);
    case "parliament":
      return (<svg width="60" height="60" viewBox="0 0 60 60" fill="none"><polygon points="30,5 55,30 30,55 5,30" stroke={color} strokeWidth="2" fill="none" /><circle cx="30" cy="30" r="8" stroke={color} strokeWidth="1.5" fill="none" /><circle cx="30" cy="30" r="3" fill={color} opacity="0.7" /><line x1="30" y1="22" x2="30" y2="10" stroke={color} strokeWidth="1" /><line x1="30" y1="38" x2="30" y2="50" stroke={color} strokeWidth="1" /><line x1="22" y1="30" x2="10" y2="30" stroke={color} strokeWidth="1" /><line x1="38" y1="30" x2="50" y2="30" stroke={color} strokeWidth="1" /></svg>);
    case "deepforge":
      return (<svg width="60" height="60" viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="22" stroke={color} strokeWidth="2" fill="none" /><path d="M30 8 L30 12 M30 48 L30 52 M8 30 L12 30 M48 30 L52 30" stroke={color} strokeWidth="2" /><circle cx="30" cy="30" r="10" stroke={color} strokeWidth="1.5" fill="none" /><circle cx="30" cy="30" r="4" fill={color} opacity="0.5" /></svg>);
    case "convoy":
      return (<svg width="60" height="60" viewBox="0 0 60 60" fill="none"><path d="M15 20 Q20 15 25 20 L25 28" stroke={color} strokeWidth="2.5" strokeLinecap="round" /><path d="M25 28 L25 32" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 4" /><path d="M35 28 Q40 33 35 38 L35 32" stroke={color} strokeWidth="2.5" strokeLinecap="round" /><path d="M35 32 L35 28" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 4" /></svg>);
    case "unseen":
      return (<svg width="60" height="60" viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="22" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="3 3" /><circle cx="30" cy="30" r="15" stroke={color} strokeWidth="1" fill="none" opacity="0.4" /></svg>);
  }
};

// ── Riddles ────────────────────────────────────────────────────────────────────
const RIDDLES = [
  {
    id: 1,
    question: "I am given at your peak and called a mercy. I am performed at dawn in white cloaks and laurel crowns. The Republic calls me a gift. The Convoy calls me a crime. What am I?",
    answers: ["apotheosis", "apex", "the ceremony"]
  },
  {
    id: 2,
    question: "She married the man who held the key to her true love's survival. She burned every letter she wrote to him. Her sacrifice was invisible to the world. Who is she?",
    answers: ["quinn", "quinnevere"]
  },
  {
    id: 3,
    question: "She arrived at Pantheon Ivory as a nobody. She left carrying gold pins she could not yet wear. She seduced a Sol Deus for a master key. She is the most dangerous person in Panterra, and no one knows it yet. Who is she?",
    answers: ["verlaine"]
  }
];

// ── Context ────────────────────────────────────────────────────────────────────
interface GameState {
  foundScrolls: number[];
  questCompleted: boolean;
  questArchetype: string | null;
  riddlesSolved: number;
  valoricaRevealed: boolean;
  activeModal: "scroll" | "quest" | "riddle" | "riddleSuccess" | "valoricaReveal" | null;
  activeScrollId: number | null;
}

interface GameContextType extends GameState {
  foundScroll: (id: number) => void;
  closeModal: () => void;
  startQuest: () => void;
  completeQuest: (archetype: string) => void;
  startRiddle: () => void;
  solveRiddle: () => void;
  awardScroll: (id: number) => void;
  triggerValoricaReveal: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem("chronicles_game_state_v2");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      foundScrolls: [],
      questCompleted: false,
      questArchetype: null,
      riddlesSolved: 0,
      valoricaRevealed: false,
      activeModal: null,
      activeScrollId: null
    };
  });

  useEffect(() => {
    localStorage.setItem("chronicles_game_state_v2", JSON.stringify(state));
  }, [state]);

  const foundScroll = (id: number) => {
    const scroll = SCROLLS.find(s => s.id === id);
    if (!state.foundScrolls.includes(id)) {
      toast({
        title: `Fragment ${id} Recovered`,
        description: scroll ? `"${scroll.title}"` : "A forbidden truth surfaces.",
        className: "bg-amber-950 border-amber-500 text-amber-100",
      });
      setState(prev => ({
        ...prev,
        foundScrolls: [...prev.foundScrolls, id],
        activeModal: "scroll",
        activeScrollId: id
      }));
    } else {
      setState(prev => ({ ...prev, activeModal: "scroll", activeScrollId: id }));
    }
  };

  const awardScroll = (id: number) => foundScroll(id);

  const closeModal = () => setState(prev => ({ ...prev, activeModal: null, activeScrollId: null }));
  const startQuest  = () => setState(prev => ({ ...prev, activeModal: "quest" }));

  const completeQuest = (archetype: string) => {
    setState(prev => {
      const newState = { ...prev, questCompleted: true, questArchetype: archetype, activeModal: null as GameState["activeModal"] };
      return newState;
    });
  };

  const startRiddle  = () => setState(prev => ({ ...prev, activeModal: "riddle" }));
  const solveRiddle  = () => {
    setState(prev => {
      const newCount = prev.riddlesSolved + 1;
      if (newCount >= 3) return { ...prev, riddlesSolved: 3, activeModal: "riddleSuccess" };
      return { ...prev, riddlesSolved: newCount };
    });
  };

  const triggerValoricaReveal = () => {
    setState(prev => ({ ...prev, valoricaRevealed: true, activeModal: "valoricaReveal" }));
  };

  return (
    <GameContext.Provider value={{
      ...state,
      foundScroll, closeModal, startQuest, completeQuest,
      startRiddle, solveRiddle,
      awardScroll,
      triggerValoricaReveal
    }}>
      {children}
      <GameUI />
    </GameContext.Provider>
  );
};

// ── HiddenOrb ─────────────────────────────────────────────────────────────────
export const HiddenOrb = ({ id, className }: { id: number; className?: string }) => {
  const { foundScroll, foundScrolls } = useGame();
  const isFound = foundScrolls.includes(id);
  return (
    <motion.button
      onClick={() => foundScroll(id)}
      className={cn(
        "relative w-3 h-3 sm:w-4 sm:h-4 rounded-full cursor-pointer z-40 group",
        isFound ? "opacity-20" : "animate-pulse",
        className
      )}
      whileHover={{ scale: 1.5 }}
    >
      <div className={cn(
        "absolute inset-0 rounded-full blur-[2px]",
        isFound ? "bg-amber-900/40" : "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
      )} />
      <div className={cn("absolute inset-0 rounded-full", isFound ? "bg-amber-950/60" : "bg-amber-400")} />
      <span className="sr-only">Hidden Orb</span>
    </motion.button>
  );
};

// ── HiddenSigil ───────────────────────────────────────────────────────────────
export const HiddenSigil = ({ className }: { className?: string }) => {
  const { startRiddle } = useGame();
  return (
    <button onClick={startRiddle} className={cn("opacity-10 hover:opacity-100 transition-opacity duration-700 text-amber-700 hover:text-amber-500", className)}>
      <span className="text-xl">❦</span>
    </button>
  );
};

// ── QuestTrigger ──────────────────────────────────────────────────────────────
export const QuestTrigger = ({ className }: { className?: string }) => {
  const { startQuest, questCompleted, questArchetype } = useGame();
  const storedResult = typeof window !== "undefined" ? localStorage.getItem("allegiance-result") : null;
  const allegiance = storedResult ? ALLEGIANCE_DATA[storedResult as AllegianceId] : null;

  if ((questCompleted && questArchetype) || allegiance) {
    const displayName = allegiance?.name ?? questArchetype ?? "Unknown";
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 border border-primary/40 text-primary font-display text-xs tracking-widest uppercase"
        >
          <span>{displayName}</span>
        </motion.div>
        <button
          onClick={startQuest}
          className="font-body text-[9px] tracking-[0.2em] uppercase transition-colors"
          style={{ color: "hsl(38 30% 40%)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "hsl(38 60% 55%)")}
          onMouseLeave={e => (e.currentTarget.style.color = "hsl(38 30% 40%)")}
        >
          Retake the Quiz
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={startQuest}
      className={cn("px-8 py-3 border border-amber-600/50 bg-black/40 text-amber-500 font-display text-sm tracking-[0.25em] uppercase hover:bg-amber-900/20 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300", className)}
    >
      Choose Your Allegiance
    </button>
  );
};

// ── Scroll collection display (used on Index / dedicated pages) ───────────────
export const ScrollCollection = ({ className }: { className?: string }) => {
  const { foundScrolls } = useGame();
  const total = TOTAL_SCROLLS;
  const recovered = foundScrolls.filter(id => id >= 1 && id <= 12).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Bestiary complete persistent banner */}
      <BestiaryCompleteBanner />

      {/* Progress header */}
      <div className="flex items-center justify-between">
        <p className="font-display text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          {recovered} of {total} Fragments Recovered
        </p>
        <div className="flex gap-1">
          {SCROLLS.map(s => (
            <div
              key={s.id}
              className="w-1.5 h-4 rounded-sm transition-all duration-500"
              style={{ background: foundScrolls.includes(s.id) ? "hsl(38 72% 50%)" : "hsl(38 20% 20%)" }}
            />
          ))}
        </div>
      </div>

      {/* Scroll cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {SCROLLS.map(scroll => {
          const found = foundScrolls.includes(scroll.id);
          return (
            <motion.div
              key={scroll.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: scroll.id * 0.05 }}
              className={cn(
                "relative border p-4 transition-all duration-300",
                found
                  ? "bg-[#12100a] border-amber-900/50"
                  : "bg-[#0d0b08] border-border/30"
              )}
            >
              {/* Scroll number */}
              <div className="flex items-start justify-between mb-2">
                <span
                  className="font-display text-[8px] tracking-[0.35em] uppercase"
                  style={{ color: found ? "hsl(38 72% 50%)" : "hsl(38 15% 35%)" }}
                >
                  Fragment {scroll.id}
                </span>
                {found ? (
                  <Sparkles size={11} className="text-amber-600/60 flex-shrink-0" />
                ) : (
                  /* Dimmed glowing orb icon for locked scrolls */
                  <div className="relative w-3 h-3 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-amber-800/20 blur-[1px]" />
                    <div className="absolute inset-0.5 rounded-full bg-amber-900/30" />
                  </div>
                )}
              </div>

              {found ? (
                <>
                  <p className="font-display text-[11px] tracking-wide text-foreground/90 mb-2 leading-snug">
                    {scroll.title}
                  </p>
                  <p className="font-narrative italic text-[0.875rem] text-foreground/70 leading-[1.75]">
                    "{scroll.text}"
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-[11px] tracking-wide text-muted-foreground/30 mb-2">
                    Not yet found
                  </p>
                  <p className="font-body text-[9px] tracking-wide text-muted-foreground/40 italic">
                    ↳ {scroll.hint}
                  </p>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Sealed document puzzle */}
      <SealedDocumentPuzzle foundScrolls={foundScrolls} />

      {/* Bestiary subtle footer link */}
      <div className="text-center pt-2">
        <Link
          to="/bestiary"
          className="font-narrative italic text-[0.8125rem] transition-colors"
          style={{ color: "hsl(38 30% 32%)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "hsl(38 60% 50%)")}
          onMouseLeave={e => (e.currentTarget.style.color = "hsl(38 30% 32%)")}
        >
          The Bestiary of Panterra →
        </Link>
      </div>
    </div>
  );
};

// ── Sealed Document Puzzle ────────────────────────────────────────────────────
const SealedDocumentPuzzle = ({ foundScrolls }: { foundScrolls: number[] }) => {
  const { triggerValoricaReveal, valoricaRevealed } = useGame();
  const allFound = SCROLLS.every(s => foundScrolls.includes(s.id));

  const [order, setOrder] = useState<number[]>(() => {
    const ids = SCROLLS.map(s => s.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    const alreadyCorrect = ids.every((id, idx) => id === CORRECT_ORDER[idx]);
    if (alreadyCorrect) { const tmp = ids[0]; ids[0] = ids[1]; ids[1] = tmp; }
    return ids;
  });

  // Pointer-based drag state (works on both mouse and touch)
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [overIdx, setOverIdx]     = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [result, setResult]     = useState<"correct" | "wrong" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!allFound) return null;

  // ── Pointer handlers ──────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggedId(id);
    setOverIdx(order.indexOf(id));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggedId === null || !containerRef.current) return;
    const items = containerRef.current.querySelectorAll<HTMLElement>("[data-drag-item]");
    let targetIdx: number | null = null;
    items.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        targetIdx = idx;
      }
    });
    if (targetIdx !== null && targetIdx !== overIdx) {
      setOverIdx(targetIdx);
      setOrder(prev => {
        const next = [...prev];
        const fromIdx = next.indexOf(draggedId);
        if (fromIdx === targetIdx) return prev;
        next.splice(fromIdx, 1);
        next.splice(targetIdx!, 0, draggedId);
        return next;
      });
    }
  };

  const handlePointerUp = () => {
    setDraggedId(null);
    setOverIdx(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    setSubmitted(true);
    const isCorrect = order.every((id, i) => id === CORRECT_ORDER[i]);
    if (isCorrect) {
      setResult("correct");
      setTimeout(() => triggerValoricaReveal(), 600);
    } else {
      setResult("wrong");
      setTimeout(() => { setResult(null); setSubmitted(false); }, 3000);
    }
  };

  if (valoricaRevealed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-amber-800/40 bg-[#0d0b08] p-6 text-center"
      >
        <p className="font-display text-[9px] tracking-[0.35em] uppercase text-amber-600/60 mb-2">
          The Sealed Document — Solved
        </p>
        <p className="font-narrative italic text-amber-700/60 text-sm">
          "Valorica exists. The boundary holds."
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="border border-amber-800/50 bg-[#0d0b08] p-5 space-y-4"
    >
      {/* Header */}
      <div className="text-center">
        <p className="font-display text-[8px] tracking-[0.4em] uppercase text-amber-600/50 mb-1">
          ✦ All Fragments Recovered ✦
        </p>
        <h3 className="font-display text-sm tracking-[0.2em] text-amber-400/90">
          The Sealed Document
        </h3>
        <div className="h-px bg-amber-900/30 mt-3" />
        <p className="font-body text-[9px] text-muted-foreground mt-3 leading-relaxed">
          Drag the fragments into their correct order. When the truth aligns, the document opens.
        </p>
      </div>

      {/* Draggable cards — pointer events work on mouse and touch */}
      <div
        ref={containerRef}
        className="space-y-2 touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {order.map((id, i) => {
          const scroll = SCROLLS.find(s => s.id === id)!;
          const isGrabbed = draggedId === id;
          return (
            <div
              key={id}
              data-drag-item
              onPointerDown={(e) => handlePointerDown(e, id)}
              className={cn(
                "flex items-start gap-3 p-3 border transition-all duration-150 select-none touch-none",
                isGrabbed
                  ? "opacity-60 border-amber-500/60 bg-amber-950/30 shadow-[0_4px_20px_rgba(245,158,11,0.15)] scale-[1.01] cursor-grabbing"
                  : "border-amber-900/30 bg-[#13110d] hover:border-amber-800/50 cursor-grab"
              )}
              style={{ userSelect: "none" }}
            >
              <span className="font-display text-[10px] text-amber-700/60 flex-shrink-0 w-4 pt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display text-[10px] tracking-wide text-amber-500/80 leading-snug truncate">
                  {scroll.title}
                </p>
                <p className="font-narrative italic text-[0.8125rem] text-foreground/50 leading-[1.65] mt-0.5 line-clamp-2">
                  "{scroll.text}"
                </p>
              </div>
              <span className="text-muted-foreground/20 text-xs flex-shrink-0 pt-0.5">⠿</span>
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {result === "wrong" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-narrative italic text-red-500/70 text-xs text-center leading-relaxed"
          >
            "The fragments resist your arrangement. Something is still missing."
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitted && result !== "wrong"}
        className={cn(
          "w-full py-3 font-display text-[10px] tracking-[0.3em] uppercase transition-all duration-300 border",
          "border-amber-800/50 text-amber-600 hover:border-amber-600/80 hover:text-amber-400 hover:shadow-[0_0_15px_hsl(38_72%_50%_/_0.15)]",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        Submit Order
      </button>
    </motion.div>
  );
};

// ── Modal backdrop ─────────────────────────────────────────────────────────────
const ModalBackdrop = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/95 flex items-start justify-center p-4 sm:items-center backdrop-blur-sm overflow-y-auto"
    onClick={onClick}
  >
    {children}
  </motion.div>
);

// ── Bestiary Complete Persistent Banner ───────────────────────────────────────
const BestiaryCompleteBanner = () => {
  const seen = localStorage.getItem(BESTIARY_COMPLETE_KEY) === "true";
  if (!seen) return null;
  return (
    <div
      className="border px-4 py-2.5 text-center"
      style={{
        borderColor: "hsl(38 50% 30% / 0.4)",
        background: "hsl(20 12% 7%)",
      }}
    >
      <p className="font-narrative italic text-[0.8125rem] text-foreground/50">
        The Bestiary is complete.{" "}
        <Link
          to="/bestiary"
          className="transition-colors"
          style={{ color: "hsl(38 60% 50%)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "hsl(38 72% 60%)")}
          onMouseLeave={e => (e.currentTarget.style.color = "hsl(38 60% 50%)")}
        >
          Something remains.
        </Link>
      </p>
    </div>
  );
};

// ── Bestiary Complete Popup ──────────────────────────────────────────────────
export const BestiaryCompletePopup = () => {
  const { foundScrolls } = useGame();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const triggered = useRef(false);

  // Track previous scroll count to detect the moment the 5th lands
  const prevCount = useRef(
    GAME_SCROLL_IDS.filter(id => foundScrolls.includes(id)).length
  );

  useEffect(() => {
    if (triggered.current) return;
    if (localStorage.getItem(BESTIARY_COMPLETE_KEY) === "true") {
      triggered.current = true;
      return;
    }
    const count = GAME_SCROLL_IDS.filter(id => foundScrolls.includes(id)).length;
    if (count === 5 && prevCount.current < 5) {
      triggered.current = true;
      // Delay 1.5s so the game win screen finishes first
      setTimeout(() => {
        localStorage.setItem(BESTIARY_COMPLETE_KEY, "true");
        setShow(true);
      }, 1500);
    }
    prevCount.current = count;
  }, [foundScrolls]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[250] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative max-w-lg w-full mx-4 p-8 sm:p-10 text-center"
        style={{
          background: "hsl(20 12% 7%)",
          border: "1px solid hsl(38 60% 40% / 0.5)",
          animation: "bestiaryGlowPulse 3s ease-in-out infinite",
        }}
      >
        {/* Small caps header */}
        <p
          className="font-display text-[8px] tracking-[0.5em] uppercase mb-4"
          style={{ color: "hsl(38 40% 45%)" }}
        >
          The Chronicles of Panterra
        </p>

        {/* Cinematic title — word-by-word fade */}
        <h2
          className="font-display text-2xl sm:text-3xl tracking-[0.1em] mb-5"
          style={{ color: "hsl(38 72% 55%)", textShadow: "0 0 30px hsl(38 72% 50% / 0.3)" }}
        >
          {"The Bestiary Is Complete".split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.4, duration: 0.6 }}
              className="inline-block mr-[0.3em]"
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 2.8, duration: 0.8 }}
          className="h-px w-32 mx-auto mb-6"
          style={{ background: "linear-gradient(90deg, transparent, hsl(38 60% 50% / 0.5), transparent)" }}
        />

        {/* Body */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 0.8 }}
          className="font-narrative italic text-[0.9375rem] sm:text-base leading-[1.9] mb-8"
          style={{ color: "hsl(38 25% 75%)" }}
        >
          "You have walked every path Panterra laid before you. Every monster has been named. Every consequence recorded. One thing remains that cannot be named."
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.8, duration: 0.6 }}
          className="space-y-3"
        >
          <button
            onClick={() => { setShow(false); navigate("/bestiary"); }}
            className="w-full py-3 font-display text-[10px] tracking-[0.3em] uppercase border transition-all duration-300 btn-pulse-glow"
            style={{
              borderColor: "hsl(38 60% 45% / 0.6)",
              color: "hsl(38 72% 55%)",
              background: "transparent",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "hsl(38 72% 50% / 0.1)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 72% 50% / 0.8)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 60% 45% / 0.6)";
            }}
          >
            Enter the Bestiary →
          </button>
          <button
            onClick={() => setShow(false)}
            className="font-body text-[9px] tracking-[0.2em] uppercase transition-colors"
            style={{ color: "hsl(38 20% 40%)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "hsl(38 50% 55%)")}
            onMouseLeave={e => (e.currentTarget.style.color = "hsl(38 20% 40%)")}
          >
            Return to the Chronicles
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ── GameUI ────────────────────────────────────────────────────────────────────
const GameUI = () => {
  const { activeModal, closeModal, activeScrollId, foundScrolls, solveRiddle, riddlesSolved, completeQuest } = useGame();
  return (
    <AnimatePresence>
      {activeModal === "scroll" && activeScrollId && (
        <ScrollModal id={activeScrollId} count={foundScrolls.filter(id => id >= 1 && id <= 12).length} onClose={closeModal} />
      )}
      {activeModal === "quest" && (
        <QuestModal onClose={closeModal} onComplete={completeQuest} />
      )}
      {activeModal === "riddle" && (
        <RiddleModal solvedCount={riddlesSolved} onSolve={solveRiddle} onClose={closeModal} />
      )}
      {activeModal === "riddleSuccess" && (
        <RiddleSuccessModal onClose={closeModal} />
      )}
      {activeModal === "valoricaReveal" && (
        <ValoricaRevealModal onClose={closeModal} />
      )}
    </AnimatePresence>
  );
};

// ── ScrollModal ───────────────────────────────────────────────────────────────
const ScrollModal = ({ id, count, onClose }: { id: number; count: number; onClose: () => void }) => {
  const scroll = SCROLLS.find(s => s.id === id);
  const allFound = count >= TOTAL_SCROLLS;
  return (
    <ModalBackdrop onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-[#e8dcc0] text-amber-950 p-6 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] font-serif border-4 border-double border-amber-900/40 my-auto mt-6 sm:mt-0"
        style={{ clipPath: "polygon(0% 0%, 100% 2%, 98% 100%, 2% 98%)" }}
      >
        <div className="absolute top-2 left-2 text-amber-900/20"><Scroll className="w-6 h-6 sm:w-8 sm:h-8" /></div>
        <h3 className="text-center font-display text-lg sm:text-xl tracking-[0.2em] mb-1 text-amber-900">
          Fragment {id}
        </h3>
        <h4 className="text-center font-display text-xs tracking-[0.15em] text-amber-800/60 mb-5 border-b border-amber-900/20 pb-4">
          {scroll?.title}
        </h4>
        <p className="text-[1.0625rem] sm:text-lg leading-[1.8] italic mb-6 sm:mb-8 font-narrative">
          "{scroll?.text}"
        </p>
        <div className="text-center text-xs font-sans tracking-widest uppercase text-amber-900/60">
          {count} of {TOTAL_SCROLLS} Fragments Recovered
        </div>
        {allFound && (
          <div className="mt-6 pt-5 border-t border-amber-900/20 text-center">
            <p className="text-[10px] font-display tracking-widest text-amber-900/50 uppercase">
              All fragments recovered — return to the Chronicles to complete the document
            </p>
          </div>
        )}
      </motion.div>
    </ModalBackdrop>
  );
};

// ── QuestModal (Allegiance Quiz) ──────────────────────────────────────────
const QuestModal = ({ onClose, onComplete }: { onClose: () => void; onComplete: (a: string) => void }) => {
  const { awardScroll } = useGame();
  const [questions] = useState(() => buildQuizQuestions());
  const [qIdx, setQIdx] = useState(0);
  const [scores, setScores] = useState<Record<Exclude<AllegianceId, "unseen">, number>>({
    sanctorium: 0, parliament: 0, deepforge: 0, convoy: 0,
  });
  const [lastAnswer, setLastAnswer] = useState<Exclude<AllegianceId, "unseen">>("sanctorium");
  const [result, setResult] = useState<AllegianceId | null>(null);
  const [revealStage, setRevealStage] = useState(0);
  const [closing, setClosing] = useState(false);

  const handleAnswer = (allegiance: Exclude<AllegianceId, "unseen">) => {
    const newScores = { ...scores, [allegiance]: scores[allegiance] + 1 };
    setScores(newScores);
    setLastAnswer(allegiance);

    if (qIdx < questions.length - 1) {
      setQIdx(prev => prev + 1);
    } else {
      const winner = resolveAllegiance(newScores, allegiance);
      localStorage.setItem("allegiance-result", winner);
      const data = ALLEGIANCE_DATA[winner];
      localStorage.setItem(data.storageKey, "true");
      if (data.scrollAward && !localStorage.getItem("allegiance-scroll-7-awarded")) {
        awardScroll(data.scrollAward);
        localStorage.setItem("allegiance-scroll-7-awarded", "true");
      }

      const delay = winner === "unseen" ? 2000 : 0;
      setTimeout(() => {
        setResult(winner);
        setTimeout(() => setRevealStage(1), 1200);
        setTimeout(() => setRevealStage(2), 3200);
        setTimeout(() => setRevealStage(3), 4500);
      }, delay);
    }
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onComplete(result ?? "sanctorium"), 600);
  };

  const currentQ = questions[qIdx];

  return (
    <ModalBackdrop onClick={!result && !closing ? onClose : undefined}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl mx-auto flex flex-col items-center justify-start sm:justify-center text-center p-4 sm:p-6 py-10 min-h-full"
      >
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-6 max-w-xl w-full"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                <AllegianceSymbol allegiance={result} />
              </motion.div>

              {revealStage >= 1 && (
                <h2
                  className="font-display text-2xl sm:text-4xl tracking-[0.12em]"
                  style={{ color: "hsl(38 72% 55%)", textShadow: "0 0 30px hsl(38 72% 50% / 0.3)" }}
                >
                  {ALLEGIANCE_DATA[result].name.split("").map((ch, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.08, duration: 0.3 }}
                      className="inline-block"
                      style={{ whiteSpace: ch === " " ? "pre" : undefined }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </h2>
              )}

              {revealStage >= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col items-center gap-5"
                >
                  <div
                    className="h-px w-24"
                    style={{ background: "linear-gradient(90deg, transparent, hsl(38 60% 50% / 0.5), transparent)" }}
                  />
                  <p
                    className="font-narrative italic text-[0.9375rem] sm:text-base leading-[1.9] max-w-md"
                    style={{ color: "hsl(38 25% 75%)" }}
                  >
                    "{ALLEGIANCE_DATA[result].text}"
                  </p>
                  <p
                    className="font-display text-[8px] tracking-[0.4em] uppercase"
                    style={{ color: "hsl(38 40% 40%)" }}
                  >
                    Your allegiance has been recorded.
                  </p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="font-narrative italic text-[0.8125rem]"
                    style={{ color: "hsl(38 50% 50%)" }}
                  >
                    Something has been unlocked.
                  </motion.p>
                </motion.div>
              )}

              {revealStage >= 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <button
                    onClick={handleClose}
                    className="min-h-[44px] text-xs tracking-[0.3em] uppercase font-body border px-6 py-3 transition-colors"
                    style={{ color: "hsl(38 50% 50%)", borderColor: "hsl(38 40% 30%)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 60% 50%)"; (e.currentTarget as HTMLButtonElement).style.color = "hsl(38 72% 60%)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 40% 30%)"; (e.currentTarget as HTMLButtonElement).style.color = "hsl(38 50% 50%)"; }}
                  >
                    Continue
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
              <h2 className="font-display text-[1.6rem] sm:text-5xl text-amber-100 tracking-[0.08em] sm:tracking-[0.1em] mb-6 sm:mb-12 drop-shadow-lg leading-tight">
                Choose Your Allegiance
              </h2>
              <motion.div
                key={qIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/80 border border-amber-900/50 p-6 sm:p-12 max-w-2xl w-full backdrop-blur-md"
              >
                <div className="text-amber-500/50 text-xs tracking-[0.3em] uppercase mb-4 sm:mb-6 font-body">
                  Question {qIdx + 1} of 8
                </div>
                <p className="font-narrative text-[1.0625rem] sm:text-xl text-amber-50 mb-6 sm:mb-10 leading-[1.8]">
                  "{currentQ.question}"
                </p>
                <div className="space-y-3 sm:space-y-4">
                  {currentQ.answers.map((ans, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(ans.allegiance)}
                      className="w-full text-left p-4 min-h-[48px] border border-amber-900/30 hover:border-amber-500/80 hover:bg-amber-900/20 text-amber-100/80 hover:text-white transition-all duration-300 font-body text-[0.9375rem] sm:text-sm tracking-wide leading-[1.6]"
                    >
                      {ans.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ModalBackdrop>
  );
};

// ── RiddleModal ───────────────────────────────────────────────────────────────
const RiddleModal = ({ solvedCount, onSolve, onClose }: { solvedCount: number; onSolve: () => void; onClose: () => void }) => {
  const [answer, setAnswer] = useState("");
  const [error, setError]   = useState(false);
  const currentRiddle = RIDDLES[solvedCount];

  if (solvedCount >= 3) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnswer = answer.toLowerCase().trim();
    if (currentRiddle.answers.includes(cleanAnswer)) {
      setAnswer("");
      setError(false);
      onSolve();
    } else {
      setError(true);
      setAnswer("");
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="max-w-xl w-full bg-zinc-950 border border-amber-900 p-6 sm:p-10 text-center relative my-auto mt-6 sm:mt-0"
      >
        <div className="absolute top-4 right-4 text-amber-900/40 font-display text-4xl opacity-20">III</div>
        <h3 className="font-display text-[1.375rem] sm:text-2xl text-amber-500 tracking-[0.2em] mb-2">The Sanctorium's Final Test</h3>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-700 to-transparent mx-auto mb-6 sm:mb-8" />
        <p className="font-display text-xs text-amber-700 uppercase tracking-widest mb-4 sm:mb-6">Gate {solvedCount + 1}</p>
        <p className="font-narrative text-[1.0625rem] sm:text-lg text-amber-100/90 italic mb-6 sm:mb-8 leading-[1.8]">
          "{currentRiddle.question}"
        </p>
        <form onSubmit={handleSubmit} className="relative max-w-sm mx-auto">
          <input
            autoFocus
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Speak the word..."
            className={cn(
              "w-full bg-transparent border-b border-amber-900/50 py-3 text-center text-amber-100 focus:outline-none focus:border-amber-500 font-display tracking-widest uppercase transition-colors text-base",
              error && "border-red-500 text-red-500 animate-pulse"
            )}
          />
          {error && <p className="mt-4 text-xs text-red-500 font-body uppercase tracking-widest">The gate remains shut.</p>}
        </form>
      </motion.div>
    </ModalBackdrop>
  );
};

// ── RiddleSuccessModal ────────────────────────────────────────────────────────
const RiddleSuccessModal = ({ onClose }: { onClose: () => void }) => (
  <ModalBackdrop onClick={onClose}>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="max-w-2xl w-full bg-transparent text-center my-auto mt-6 sm:mt-0"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="bg-[#1a1510] p-7 sm:p-12 border border-amber-900/30 shadow-[0_0_100px_rgba(245,158,11,0.1)] relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        <h2 className="font-display text-[1.5rem] sm:text-3xl text-amber-500 tracking-[0.12em] sm:tracking-[0.15em] mb-6 sm:mb-8 relative z-10">What the Laurels Buried</h2>
        <div className="font-narrative text-[1.0625rem] sm:text-lg text-amber-100/70 italic leading-[1.8] relative z-10 space-y-4 sm:space-y-6">
          <p>"The satellite net will fail. The meteor shower will come."</p>
          <p>"The Convoy knows. Gable knows. Remsays knows. And the twelve Sol Deos knew thirty years ago when it happened to Rockfall — and chose silence then too."</p>
          <p className="text-amber-50">"The soul is the world's most valued currency. Now ask yourself: who has been collecting?"</p>
        </div>
      </motion.div>
    </motion.div>
  </ModalBackdrop>
);

// ── Valorica Reveal Modal (cinematic full-screen) ──────────────────────────────
const ValoricaRevealModal = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [onClose]);

  // Generate static particle positions
  const particles = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      dur: Math.random() * 6 + 5,
      delay: Math.random() * 4,
    }))
  );

  return (
    <motion.div
        key="valorica-reveal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#04030a" }}
        onClick={onClose}
      >
        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.current.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: "hsl(38 72% 55%)",
              }}
              animate={{
                opacity: [0, 0.6, 0],
                y: [0, -30, -60],
              }}
              transition={{
                duration: p.dur,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, hsl(38 72% 50% / 0.06) 0%, transparent 65%)" }}
        />

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="relative z-10 max-w-xl px-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-display text-[9px] tracking-[0.5em] uppercase text-amber-600/50 mb-8"
          >
            ✦ The Document Opens ✦
          </motion.div>
          <p
            className="font-display text-xl sm:text-2xl leading-[2] tracking-[0.08em]"
            style={{ color: "hsl(38 72% 60%)", textShadow: "0 0 40px hsl(38 72% 50% / 0.35)" }}
          >
            Valorica exists.{" "}
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}>
              It has always existed.
            </motion.span>
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 1.2 }}
            className="font-display text-base sm:text-lg mt-6 tracking-[0.06em]"
            style={{ color: "hsl(38 50% 45%)", textShadow: "0 0 25px hsl(38 72% 50% / 0.2)" }}
          >
            What happens there — that is not for this world to know.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5.8, duration: 0.8 }}
            className="font-body text-[9px] tracking-[0.3em] uppercase text-amber-900/40 mt-10"
          >
            Tap to dismiss
          </motion.p>
        </motion.div>
      </motion.div>
  );
};
