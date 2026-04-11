import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { isTouch } from "@/components/CustomCursor";
import ParticleCanvas from "@/components/ParticleCanvas";
import { CHAPTERS } from "@/data/chapters-data";
import manuscriptHero from "@/assets/manuscript-hero.jpg";

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
      <div className="gold-divider max-w-xs mx-auto mb-6" />

      <div className="text-center mb-1">
        <h3 className="font-display text-xl tracking-[0.12em] text-primary">
          {chapter.title}
        </h3>
      </div>
      <p className="text-center font-body text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Chapter {chapter.number} of {CHAPTERS.length}
      </p>
      <div className="gold-divider max-w-[120px] mx-auto mb-6" />

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
      {/* Hero Banner */}
      <div
        className="relative h-[40vh] sm:h-[50vh] w-full bg-cover"
        style={{ backgroundImage: `url(${manuscriptHero})`, backgroundPosition: "center 30%" }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 50%, #0f0b06)" }}
        />
        <ParticleCanvas density={0.5} />
        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-8">
          <p className="font-display text-[9px] tracking-[0.4em] uppercase text-muted-foreground mb-2">
            ✦ Sample Chapters ✦
          </p>
          <h1 className="font-display text-xl sm:text-2xl tracking-[0.15em] text-foreground">
            Read the First Six Chapters
          </h1>
        </div>
      </div>

      <section className="pb-16 sm:pb-20 pt-10 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal delay={0.15}>
            <SampleChapters />
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Manuscript;
