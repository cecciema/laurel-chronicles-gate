import { useState, useRef, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import CustomCursor, { isTouch } from "@/components/CustomCursor";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GuideOnboarding, { GUIDE_STORAGE_KEY } from "@/components/GuideOnboarding";
import { GameProvider, BestiaryCompletePopup } from "@/components/ChroniclesSystem";
import { BESTIARY_ENABLED } from "@/config/features";
import Index from "./pages/Index";
import WorldOverview from "./pages/WorldOverview";
import Characters from "./pages/Characters";
import Timeline from "./pages/Timeline";
import WorldMap from "./pages/WorldMap";

import NotFound from "./pages/NotFound";
import Bestiary from "./pages/Bestiary";
import Manuscript from "./pages/Manuscript";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const AudioToggle = ({ muted, onToggle }: { muted: boolean; onToggle: () => void }) => (
  <motion.button
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5, duration: 0.6 }}
    onClick={onToggle}
    className="btn-silver-outline fixed top-4 right-4 z-[150] w-9 h-9 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-sm"
    aria-label={muted ? "Unmute ambient audio" : "Mute ambient audio"}
  >
    {muted
      ? <VolumeX size={14} style={{ color: "hsl(var(--silver) / 0.7)" }} />
      : <Volume2 size={14} style={{ color: "hsl(var(--silver))" }} />
    }
  </motion.button>
);

const AppInner = () => {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return !!localStorage.getItem(GUIDE_STORAGE_KEY);
  });
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleOnboardingComplete = (guideId: string) => {
    setOnboardingComplete(true);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.volume = 0.3;
      audio.play().catch(() => {});
      setMuted(false);
    } else {
      audio.pause();
      setMuted(true);
    }
  };

  // ── Global scroll-reveal observer (Part 8) ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll<HTMLElement>(".reveal").forEach((el) =>
        el.classList.add("is-visible")
      );
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
        .forEach((el) => io.observe(el));
    };
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [onboardingComplete]);

  const location = useLocation();

  return (
    <>
      <audio ref={audioRef} loop src="https://cdn.freesound.org/previews/639/639958_13315998-lq.mp3" />
      <AudioToggle muted={muted} onToggle={toggleAudio} />

      {!onboardingComplete ? (
        <GuideOnboarding onComplete={handleOnboardingComplete} />
      ) : (
        <>
          {!isTouch && <CustomCursor />}
          <ScrollToTop />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Routes location={location}>
                <Route path="/" element={<Index />} />
                <Route path="/world" element={<WorldOverview />} />
                <Route path="/characters" element={<Characters />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/map" element={<WorldMap />} />
                <Route path="/manuscript" element={<Manuscript />} />
                <Route
                  path="/bestiary"
                  element={BESTIARY_ENABLED ? <Bestiary /> : <Navigate to="/" replace />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
          <BestiaryCompletePopup />
        </>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GameProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </TooltipProvider>
    </GameProvider>
  </QueryClientProvider>
);

export default App;
