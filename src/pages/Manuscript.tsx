import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { isTouch } from "@/components/CustomCursor";
import ParticleCanvas from "@/components/ParticleCanvas";
import { CHAPTERS } from "@/data/chapters-data";
import manuscriptHero from "@/assets/bottom-hero-map.jpg";
import BottomHero from "@/components/BottomHero";
import bottomHeroBg from "@/assets/manuscript-hero.jpg";
import GoldDivider from "@/components/GoldDivider";

// ── ScrollReveal ──────────────────────────────────────────────────────────────
const ScrollReveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full"
        initial={{ opacity: 0, y: 32 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, ease: "easeOut", delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// ── SampleChapters Component ──────────────────────────────────────────────────
const SampleChapters = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chapter = CHAPTERS[currentIdx];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIdx]);

  return (
    <div className="max-w-2xl mx-auto">
      <GoldDivider className="max-w-xs mx-auto mb-6" />

      <div className="text-center mb-1">
        <h3 className="font-display font-bold text-xl tracking-[0.12em] text-primary">
          {chapter.title}
        </h3>
      </div>
      <p className="text-center font-body font-bold text-[9px] tracking-[0.3em] uppercase text-white/80 mb-4" style={{ textShadow: "0 0 20px rgba(255,255,255,0.4)" }}>
        Chapter {chapter.number} of {CHAPTERS.length}
      </p>
      <GoldDivider className="max-w-[120px] mx-auto mb-6" />

      <div
        ref={scrollRef}
        className="chapter-scroll-container"
        style={{ maxHeight: "60vh", overflowY: "auto" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
          <div className="font-narrative text-[0.9375rem] leading-[1.9] text-foreground/80">
  {(() => {
    const lines = chapter.content.split("\n");
    let inPoem = false;
    let prevBlank = false;

    return lines.map((line, i) => {
      const trimmed = line.trim().replace(/—/g, ' - ');

      if (trimmed !== "") {
        prevBlank = false;
      }

      if (trimmed === "⁂") {
        inPoem = false;
        return (
          <p key={i} className="text-center my-8 tracking-widest text-foreground/30">
            ⁂
          </p>
        );
      }

      if (trimmed === "--" || trimmed === "__" || trimmed === "---") {
        inPoem = false;
        return <div key={i} className="h-4" />;
      }

      if (/^(a\s+few\s+)?years?\s+(prior|later|before|after)$/i.test(trimmed)) {
        inPoem = false;
        return (
          <p
            key={i}
            className="text-center font-display text-[10px] tracking-[0.35em] uppercase text-muted-foreground mt-2 mb-8"
          >
            {trimmed}
          </p>
        );
      }

      if (trimmed === "As They Ponder") {
        inPoem = true;
        return (
          <p
            key={i}
            className="text-center font-display text-sm tracking-[0.2em] text-foreground/60 mt-8 mb-4"
          >
            {trimmed}
          </p>
        );
      }

      if (trimmed === "") {
        if (inPoem && prevBlank) inPoem = false;
        prevBlank = true;
        return <div key={i} className="h-4" />;
      }

      if (inPoem) {
        return (
          <p
            key={i}
            style={{ textAlign: 'center' }}
            className="font-narrative italic text-foreground/70 leading-[2.2] w-full"
          >
            {trimmed}
          </p>
        );
      }

      const parts = trimmed.split(/(\*[^*]+\*)/g);
      return (
        <p key={i} className="text-left leading-[1.9] mb-0">
          {parts.map((part, j) =>
            part.startsWith("*") && part.endsWith("*") ? (
              <em key={j}>{part.slice(1, -1)}</em>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  })()}
</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={() => setCurrentIdx((i) => i - 1)}
          disabled={currentIdx === 0}
          className="font-body text-[10px] tracking-[0.25em] uppercase border border-border/40 px-5 py-2 min-h-[44px] hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          style={isTouch ? undefined : { cursor: "none" }}
        >
          ← Previous Chapter
        </button>

        <div className="flex gap-1.5">
          {CHAPTERS.map((_, i) => (
            <span
              key={i}
              className={`block w-1.5 h-1.5 rounded-full transition-colors ${i === currentIdx ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIdx((i) => i + 1)}
          disabled={currentIdx === CHAPTERS.length - 1}
          className="font-body text-[10px] tracking-[0.25em] uppercase border border-border/40 px-5 py-2 min-h-[44px] hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          style={isTouch ? undefined : { cursor: "none" }}
        >
          Next Chapter →
        </button>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Manuscript = () => {
  return (
    <Layout>
      {/* Hero with chapter reader carved into bottom half */}
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-x-0 top-0 h-[80vh] sm:h-screen">
          <img
            src={manuscriptHero}
            alt="Manuscript"
            className="absolute inset-0 h-full w-full object-contain object-top"
            style={{
              maskImage: "linear-gradient(to bottom, hsl(0 0% 0%) 0%, hsl(0 0% 0%) 58%, hsl(0 0% 0% / 0.9) 72%, hsl(0 0% 0% / 0.45) 82%, transparent 92%)",
              WebkitMaskImage: "linear-gradient(to bottom, hsl(0 0% 0%) 0%, hsl(0 0% 0%) 58%, hsl(0 0% 0% / 0.9) 72%, hsl(0 0% 0% / 0.45) 82%, transparent 92%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, hsl(224 16% 6% / 0) 0%, hsl(224 16% 6% / 0) 38%, hsl(224 16% 6% / 0.14) 56%, hsl(224 16% 6% / 0.38) 70%, hsl(224 16% 6% / 0.72) 84%, hsl(224 16% 6%) 100%)" }}
          />
          <ParticleCanvas density={0.5} />
        </div>

        {/* Chapter content starting at 50% from top */}
        <div className="relative z-10 pt-[50vh] sm:pt-[55vh] pb-16 sm:pb-20 px-5 sm:px-8">
          <div className="text-center mb-8">
            <p className="font-display font-bold text-[9px] tracking-[0.4em] uppercase text-white/80 mb-2" style={{ textShadow: "0 0 20px rgba(255,255,255,0.4)" }}>
              ◆ Sample Chapters ◆
            </p>
            <h1
              className="font-display font-bold text-xl sm:text-2xl tracking-[0.15em] text-white"
              style={{ textShadow: "0 0 30px rgba(255,255,255,0.4), 0 2px 10px rgba(255,255,255,0.2)" }}
            >
              Read the First Six Chapters
            </h1>
          </div>
          <div className="max-w-3xl mx-auto" style={{ background: "rgba(13, 14, 18, 0.72)", backdropFilter: "blur(3px)", padding: "2rem", maskImage: "linear-gradient(to bottom, transparent 0%, black 8%)" }}>
            <ScrollReveal delay={0.15}>
              <SampleChapters />
            </ScrollReveal>
          </div>
        </div>
      </div>
      <BottomHero src={bottomHeroBg} alt="Archive library" />
    </Layout>
  );
};

export default Manuscript;
