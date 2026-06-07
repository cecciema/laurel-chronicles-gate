import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { isTouch } from "@/components/CustomCursor";
import ParticleCanvas from "@/components/ParticleCanvas";
import { CHAPTERS } from "@/data/chapters-data";
import manuscriptHero from "@/assets/hero-manuscript.jpeg";
import BottomHero from "@/components/BottomHero";
import bottomHeroBg from "@/assets/bottom-hero-manuscript-new.jpeg";
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
      <p className="text-center font-narrative italic text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-4">
        {chapter.number === 1 ? "Prologue" : `Chapter ${chapter.number - 1} of ${CHAPTERS.length - 1}`}
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
          <div
            className="font-narrative text-foreground mx-auto"
            style={{ fontSize: "18.5px", lineHeight: 1.8, maxWidth: "660px" }}
          >
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
          <p key={i} className="text-center my-10 tracking-widest" style={{ color: "hsl(var(--crimson-wine) / 0.7)" }}>
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
            className="text-center font-narrative italic text-[12px] tracking-[0.28em] uppercase text-muted-foreground mt-2 mb-8"
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
            className="text-center font-display tracking-[0.2em] text-primary/80 mt-8 mb-4"
            style={{ fontSize: "15px" }}
          >
            {trimmed}
          </p>
        );
      }

      if (trimmed === "") {
        if (inPoem && prevBlank) inPoem = false;
        prevBlank = true;
        return <div key={i} className="h-5" />;
      }

      if (inPoem) {
        return (
          <p
            key={i}
            style={{ textAlign: 'center' }}
            className="font-narrative italic text-foreground/80 leading-[2.1] w-full"
          >
            {trimmed}
          </p>
        );
      }

      const parts = trimmed.split(/(\*[^*]+\*)/g);
      return (
        <p key={i} className="text-left mb-5" style={{ lineHeight: 1.8 }}>
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

      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={() => setCurrentIdx((i) => i - 1)}
          disabled={currentIdx === 0}
          className="font-body text-[10px] tracking-[0.25em] uppercase border px-5 py-2 min-h-[44px] transition-all disabled:opacity-30 disabled:pointer-events-none"
          style={{
            borderColor: "hsl(var(--silver) / 0.3)",
            color: "hsl(var(--silver) / 0.85)",
            ...(isTouch ? {} : { cursor: "none" }),
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "hsl(var(--dusky-rose) / 0.55)";
            e.currentTarget.style.color = "hsl(var(--dusky-rose))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "hsl(var(--silver) / 0.3)";
            e.currentTarget.style.color = "hsl(var(--silver) / 0.85)";
          }}
        >
          ← Previous Chapter
        </button>

        <div className="flex gap-1.5">
          {CHAPTERS.map((_, i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full transition-colors"
              style={{
                background: i === currentIdx
                  ? "hsl(var(--dusky-rose))"
                  : "hsl(var(--silver) / 0.25)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIdx((i) => i + 1)}
          disabled={currentIdx === CHAPTERS.length - 1}
          className="font-body text-[10px] tracking-[0.25em] uppercase border px-5 py-2 min-h-[44px] transition-all disabled:opacity-30 disabled:pointer-events-none"
          style={{
            borderColor: "hsl(var(--silver) / 0.3)",
            color: "hsl(var(--silver) / 0.85)",
            ...(isTouch ? {} : { cursor: "none" }),
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "hsl(var(--dusky-rose) / 0.55)";
            e.currentTarget.style.color = "hsl(var(--dusky-rose))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "hsl(var(--silver) / 0.3)";
            e.currentTarget.style.color = "hsl(var(--silver) / 0.85)";
          }}
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
            className="hero-warm-desat absolute inset-0 h-full w-full object-cover"
          />
          {/* Fade hero into solid twilight reading field */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[55%]"
            style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(250 18% 11% / 0.42) 40%, hsl(250 18% 11%) 88%)" }}
          />
          <ParticleCanvas density={0.5} />
        </div>

        {/* Chapter content starting at 50% from top */}
        <div className="relative z-10 pt-[50vh] sm:pt-[55vh] pb-16 sm:pb-20 px-5 sm:px-8 bg-gradient-to-b from-transparent via-background to-background">
          <div className="text-center mb-8">
            <p className="font-display text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-2">
              <span style={{ color: "hsl(var(--crimson-wine) / 0.85)" }}>◆</span>
              <span className="mx-3">Sample Chapters</span>
              <span style={{ color: "hsl(var(--crimson-wine) / 0.85)" }}>◆</span>
            </p>
            <h1 className="font-display font-bold text-xl sm:text-2xl tracking-[0.15em] text-primary">
              Read the First Six Chapters
            </h1>
          </div>
          <div
            className="max-w-3xl mx-auto"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--silver) / 0.12)",
              padding: "2.5rem 1.5rem",
            }}
          >
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
