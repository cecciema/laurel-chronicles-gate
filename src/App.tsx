import { useState, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import CustomCursor, { isTouch } from "@/components/CustomCursor";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import GuideOnboarding, { GUIDE_STORAGE_KEY } from "@/components/GuideOnboarding";
import { GameProvider, BestiaryCompletePopup } from "@/components/ChroniclesSystem";
import Index from "./pages/Index";
import WorldOverview from "./pages/WorldOverview";
import Characters from "./pages/Characters";
import Timeline from "./pages/Timeline";
import WorldMap from "./pages/WorldMap";

import NotFound from "./pages/NotFound";
import Bestiary from "./pages/Bestiary";

const queryClient = new QueryClient();

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

  if (!onboardingComplete) {
    return <GuideOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      {!isTouch && <CustomCursor />}
      <audio ref={audioRef} loop src="https://cdn.freesound.org/previews/639/639958_13315998-lq.mp3" />

      {/* Global audio toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        onClick={toggleAudio}
        className="fixed top-4 right-4 z-[150] w-9 h-9 flex items-center justify-center border border-primary/30 bg-background/60 backdrop-blur-sm hover:border-primary/70 transition-colors"
        style={{ boxShadow: "0 0 12px hsl(38 72% 50% / 0.1)" }}
        aria-label={muted ? "Unmute ambient audio" : "Mute ambient audio"}
      >
        {muted
          ? <VolumeX size={14} className="text-muted-foreground" />
          : <Volume2 size={14} className="text-primary" />
        }
      </motion.button>

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/world" element={<WorldOverview />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/map" element={<WorldMap />} />
        
        <Route path="/bestiary" element={<Bestiary />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BestiaryCompletePopup />
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
