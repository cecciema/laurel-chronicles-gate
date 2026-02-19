import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Scroll, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// ── Scroll data ────────────────────────────────────────────────────────────────
const SCROLLS = [
  {
    id: 1,
    title: "The Southern Burn",
    hint: "Somewhere in the dead world",
    text: "The southern hemisphere was not destroyed by war. The burn was controlled. Someone needed it empty.",
    source: "Found in the Dead Corridors maze"
  },
  {
    id: 2,
    title: "The Convoy's Origin",
    hint: "Encoded in the old transmissions",
    text: "The Convoy's first recorded communication predates the Great War by 40 years. They did not form in response to the system. They built it.",
    source: "Found in the Forbidden Transmission cipher"
  },
  {
    id: 3,
    title: "The Apotheosis Data",
    hint: "The path to ascension holds secrets",
    text: "Apotheosis yields are tracked by quadrant, by season, and by soul mass. The data is sent somewhere. The destination is not listed in any Parliament record.",
    source: "Found on the Apotheosis Path"
  },
  {
    id: 4,
    title: "The Placed Ones",
    hint: "Among the characters, a deeper truth",
    text: "Not all Sol Deus are born. Some are placed. The selection criteria have never been made public. The criteria exist.",
    source: "Awaiting discovery"
  },
  {
    id: 5,
    title: "The Boundary Signal",
    hint: "Study the world from above",
    text: "The satellites do not only herd the moon. They also maintain a boundary. Inside the boundary, signals cannot leave. Outside the boundary, one location is always excluded from surveillance.",
    source: "Awaiting discovery"
  },
  {
    id: 6,
    title: "The Excluded Place",
    hint: "The unknown holds answers",
    text: "The excluded location has a name. It was removed from all maps after the Great War. It was not destroyed. It was protected.",
    source: "Found in the unknown territory"
  },
  {
    id: 7,
    title: "Those Who Stayed",
    hint: "Your allegiance reveals more than you know",
    text: "There are people who did not take their Apotheosis. There are people who were not required to. They live outside the boundary. They have always lived there. They have been watching.",
    source: "Revealed through allegiance"
  },
];

// ── Sealed document correct order ─────────────────────────────────────────────
const CORRECT_ORDER = [1, 2, 3, 4, 5, 6, 7];

// ── Quest scenes ───────────────────────────────────────────────────────────────
const QUEST_SCENES = [
  {
    id: 1,
    text: "The Admissions Bureau has finally sent your package. Your patron soul is devastated. They ask you to stay. You:",
    options: [
      { id: "A", text: "I leave anyway. The greater good demands it.", type: "devoted" },
      { id: "B", text: "I stay. No cause is worth losing them.", type: "witness" },
      { id: "C", text: "I find a way to bring us both in — no matter what it costs.", type: "architect" }
    ]
  },
  {
    id: 2,
    text: "You discover that the most powerful man in the Republic is concealing an apocalyptic meteor shower from the people. You:",
    options: [
      { id: "A", text: "Report it. The people deserve the truth, even if it causes panic.", type: "devoted" },
      { id: "B", text: "Use the information strategically. Knowledge is leverage.", type: "architect" },
      { id: "C", text: "Trust that the authorities will handle it. That's what they're there for.", type: "witness" }
    ]
  },
  {
    id: 3,
    text: "Someone you love has married your enemy to protect your life. They meet you in secret and say 'I did this for you.' You:",
    options: [
      { id: "A", text: "Accept their sacrifice and vow to save them.", type: "devoted" },
      { id: "B", text: "Feel rage. They should have let you fight your own battles.", type: "architect" },
      { id: "C", text: "Understand, but the wound never fully heals.", type: "witness" }
    ]
  },
  {
    id: 4,
    text: "The Cornerstone Laws have kept Panterra in peace for generations. But you discover they were built on lies. You:",
    options: [
      { id: "A", text: "Tear it all down. A just world cannot be built on a rotten foundation.", type: "devoted" },
      { id: "B", text: "Protect the system. Chaos kills more people than corruption.", type: "architect" },
      { id: "C", text: "Work from the inside. Change it slowly, without breaking what feeds people.", type: "witness" }
    ]
  }
];

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

// ── Archetypes ─────────────────────────────────────────────────────────────────
const ARCHETYPES = {
  devoted: { name: "The Devoted", sigil: "✦", desc: "Like Culver, you love with everything and fight for what's right even when it costs you. Your greatest strength is also your blindspot." },
  architect: { name: "The Architect", sigil: "⬡", desc: "Like Remsays or Verlaine, you see the board before others see the pieces. The question is: who will you sacrifice to win?" },
  witness: { name: "The Witness", sigil: "◎", desc: "Like Quinn or Carmela, you carry the weight of what you know and what you cannot change. History will be written by others — but you were there when it happened." }
};

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
  awardScrollFour: () => void;
  awardScrollFive: () => void;
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

  const closeModal = () => setState(prev => ({ ...prev, activeModal: null, activeScrollId: null }));
  const startQuest  = () => setState(prev => ({ ...prev, activeModal: "quest" }));

  const completeQuest = (archetype: string) => {
    setState(prev => {
      const newState = { ...prev, questCompleted: true, questArchetype: archetype, activeModal: null as GameState["activeModal"] };
      // Award scroll 7 if archetype is "devoted"
      if (archetype === "devoted" && !prev.foundScrolls.includes(7)) {
        newState.foundScrolls = [...prev.foundScrolls, 7];
        // Show it after a brief delay
        setTimeout(() => {
          setState(s => ({ ...s, activeModal: "scroll", activeScrollId: 7 }));
        }, 3200);
      }
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

  // Placeholder award functions for games not yet built
  const awardScrollFour = () => foundScroll(4);
  const awardScrollFive = () => foundScroll(5);

  const triggerValoricaReveal = () => {
    setState(prev => ({ ...prev, valoricaRevealed: true, activeModal: "valoricaReveal" }));
  };

  return (
    <GameContext.Provider value={{
      ...state,
      foundScroll, closeModal, startQuest, completeQuest,
      startRiddle, solveRiddle,
      awardScrollFour, awardScrollFive,
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
        isFound ? "opacity-30" : "animate-pulse",
        className
      )}
      whileHover={{ scale: 1.5 }}
    >
      <div className={cn(
        "absolute inset-0 rounded-full blur-[2px]",
        isFound ? "bg-amber-900" : "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
      )} />
      <div className={cn("absolute inset-0 rounded-full", isFound ? "bg-amber-950" : "bg-amber-400")} />
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
  if (questCompleted && questArchetype) {
    const archetype = ARCHETYPES[questArchetype as keyof typeof ARCHETYPES];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className={cn("inline-flex items-center gap-2 px-4 py-2 border border-primary/40 text-primary font-display text-xs tracking-widest uppercase", className)}
      >
        <span>{archetype?.sigil}</span>
        <span>{archetype?.name}</span>
      </motion.div>
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
  const total = SCROLLS.length;
  const recovered = foundScrolls.filter(id => id >= 1 && id <= 7).length;

  return (
    <div className={cn("space-y-6", className)}>
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
                  <Lock size={10} className="text-muted-foreground/40 flex-shrink-0" />
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
const ModalBackdrop = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
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

// ── GameUI ────────────────────────────────────────────────────────────────────
const GameUI = () => {
  const { activeModal, closeModal, activeScrollId, foundScrolls, solveRiddle, riddlesSolved, completeQuest } = useGame();
  return (
    <AnimatePresence>
      {activeModal === "scroll" && activeScrollId && (
        <ScrollModal id={activeScrollId} count={foundScrolls.filter(id => id <= 7).length} onClose={closeModal} />
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
  const allFound = count >= 7;
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
          {count} of 7 Fragments Recovered
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

// ── QuestModal ────────────────────────────────────────────────────────────────
const QuestModal = ({ onClose, onComplete }: { onClose: () => void; onComplete: (a: string) => void }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [scores, setScores]         = useState({ devoted: 0, architect: 0, witness: 0 });
  const [result, setResult]         = useState<string | null>(null);
  const [confirmed, setConfirmed]   = useState(false);

  const handleChoice = (type: string) => {
    const newScores = { ...scores, [type]: scores[type as keyof typeof scores] + 1 };
    setScores(newScores);
    if (sceneIndex < QUEST_SCENES.length - 1) {
      setSceneIndex(prev => prev + 1);
    } else {
      const winner = Object.entries(newScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      setResult(winner);
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    setConfirmed(true);
    setTimeout(() => onComplete(result), 2500);
  };

  const currentScene = QUEST_SCENES[sceneIndex];
  const archetype    = result ? ARCHETYPES[result as keyof typeof ARCHETYPES] : null;

  return (
    <ModalBackdrop onClick={confirmed ? undefined : (result ? handleConfirm : onClose)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl mx-auto flex flex-col items-center justify-start sm:justify-center text-center p-4 sm:p-6 py-10 min-h-full"
      >
        <AnimatePresence mode="wait">
          {confirmed ? (
            <motion.div
              key="cinematic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[5rem] sm:text-[7rem] mb-6"
                style={{ textShadow: "0 0 60px hsl(38 72% 50% / 0.8), 0 0 120px hsl(38 72% 50% / 0.4)" }}
              >
                {archetype?.sigil}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="font-display text-2xl sm:text-4xl text-amber-400 tracking-[0.15em] sm:tracking-[0.2em] mb-5"
              >
                {archetype?.name}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="font-narrative italic text-amber-100/60 text-base sm:text-lg"
              >
                "Your allegiance is sealed. The world remembers."
              </motion.p>
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.8 }}
              />
            </motion.div>
          ) : !result ? (
            <motion.div key="scenes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
              <h2 className="font-display text-[1.6rem] sm:text-5xl text-amber-100 tracking-[0.08em] sm:tracking-[0.1em] mb-6 sm:mb-12 drop-shadow-lg leading-tight">
                Where Does Your Loyalty Lie?
              </h2>
              <motion.div
                key={sceneIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/80 border border-amber-900/50 p-6 sm:p-12 max-w-2xl w-full backdrop-blur-md"
              >
                <div className="text-amber-500/50 text-xs tracking-[0.3em] uppercase mb-4 sm:mb-6">Scene {sceneIndex + 1} of 4</div>
                <p className="font-narrative text-[1.0625rem] sm:text-xl text-amber-50 mb-6 sm:mb-10 leading-[1.8]">"{currentScene.text}"</p>
                <div className="space-y-3 sm:space-y-4">
                  {currentScene.options.map((opt) => (
                    <button key={opt.id} onClick={() => handleChoice(opt.type)}
                      className="w-full text-left p-4 min-h-[56px] border border-amber-900/30 hover:border-amber-500/80 hover:bg-amber-900/20 text-amber-100/80 hover:text-white transition-all duration-300 font-body text-[0.9375rem] sm:text-sm tracking-wide leading-[1.6]">
                      <span className="text-amber-500 mr-3 font-display">{opt.id}.</span> {opt.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
              className="bg-[#0d0a06] border border-amber-800/40 p-8 sm:p-12 max-w-xl w-full text-center shadow-[0_0_80px_rgba(245,158,11,0.08)]"
            >
              <div className="text-amber-600/40 text-xs tracking-[0.4em] uppercase mb-6">Your Allegiance Is Revealed</div>
              <div className="text-4xl sm:text-5xl text-amber-500/60 mb-6">{archetype?.sigil}</div>
              <h2 className="font-display text-[1.6rem] sm:text-3xl text-amber-400 tracking-[0.12em] sm:tracking-[0.15em] mb-6">{archetype?.name}</h2>
              <div className="h-px w-20 bg-amber-800/50 mx-auto mb-6" />
              <p className="font-narrative text-[1.0625rem] sm:text-lg text-amber-100/70 italic leading-[1.8] mb-8 sm:mb-10">"{archetype?.desc}"</p>
              {result === "devoted" && (
                <p className="font-body text-[9px] tracking-[0.2em] uppercase text-amber-700/50 mb-6">
                  ✦ A fragment of truth will be revealed to you
                </p>
              )}
              <button onClick={handleConfirm}
                className="min-h-[44px] text-xs tracking-[0.3em] uppercase text-amber-700 hover:text-amber-500 transition-colors font-body border border-amber-900/40 hover:border-amber-700/60 px-6 py-3">
                Seal Your Fate
              </button>
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
