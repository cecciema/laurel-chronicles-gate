import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { HiddenOrb, QuestTrigger, ScrollCollection } from "@/components/ChroniclesSystem";
import heroCityscape from "@/assets/hero-cityscape.jpg";

// Detect touch-only devices (no hover support)
const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

// ─── Typewriter Hook ───────────────────────────────────────────────────────────
const useTypewriter = (text: string, speed = 60, startDelay = 800) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      const tick = () => {
        if (i <= text.length) {
          setDisplayed(text.slice(0, i));
          i++;
          if (i > text.length) setDone(true);
          else timeout = setTimeout(tick, speed);
        }
      };
      tick();
    }, startDelay);
    return () => { clearTimeout(start); clearTimeout(timeout); };
  }, [text, speed, startDelay]);

  return { displayed, done };
};

// ─── Ambient Particles Canvas ─────────────────────────────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; alphaDir: number;
    };

    const particleCount = window.innerWidth < 640 ? 18 : 55;
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.1),
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir * 0.004;
        if (p.alpha > 0.65 || p.alpha < 0.05) p.alphaDir *= -1;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10 || p.x > canvas.width + 10) p.x = Math.random() * canvas.width;

        // warm ember glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        grad.addColorStop(0, `hsla(38, 80%, 65%, ${p.alpha})`);
        grad.addColorStop(1, `hsla(25, 70%, 45%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
    />
  );
};

// ─── Custom Cursor ─────────────────────────────────────────────────────────────
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const trail = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", move);

    let raf: number;
    const animate = () => {
      trail.current.x += (pos.current.x - trail.current.x) * 0.12;
      trail.current.y += (pos.current.y - trail.current.y) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x - 5}px, ${pos.current.y - 5}px)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trail.current.x - 14}px, ${trail.current.y - 14}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      {/* Inner dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-[10px] h-[10px] rounded-full pointer-events-none z-[999]"
        style={{ background: "hsl(38 80% 60%)", boxShadow: "0 0 8px hsl(38 80% 60%), 0 0 20px hsl(38 72% 50% / 0.5)" }}
      />
      {/* Outer ring */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 w-[28px] h-[28px] rounded-full pointer-events-none z-[998] border"
        style={{ borderColor: "hsl(38 72% 50% / 0.5)", boxShadow: "0 0 10px hsl(38 72% 50% / 0.2)" }}
      />
    </>
  );
};

// ─── Cinematic Intro Overlay ──────────────────────────────────────────────────
const CinematicIntro = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-background flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.8, duration: 0.9, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center"
      >
        {/* Sigil / decorative emblem */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-primary/20"
            style={{ boxShadow: "0 0 30px hsl(38 72% 50% / 0.15)" }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border border-primary/30"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-2xl text-primary" style={{ textShadow: "0 0 20px hsl(38 72% 50% / 0.6)" }}>
              ✦
            </span>
          </div>
        </div>
        <p className="font-display text-xs tracking-[0.6em] text-primary/60 uppercase">
          Entering the World
        </p>
      </motion.div>
    </motion.div>
  );
};

// ─── Scroll-reveal wrapper ─────────────────────────────────────────────────────
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
        initial={{ opacity: 0, y: 32 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, ease: "easeOut", delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};


// ─── Main Component ────────────────────────────────────────────────────────────
const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const mousePos = useRef({ x: 0, y: 0 });
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);

  // Headline typewriter — starts after intro fades (2.6s) + small gap
  const line1 = useTypewriter("LAUREL", 80, 3200);
  const line2 = useTypewriter("CROWNS", 80, 3800);
  const line3 = useTypewriter("ABOVE", 80, 4400);

  // Parallax on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const dx = (clientX / innerWidth - 0.5) * 2;
    const dy = (clientY / innerHeight - 0.5) * 2;
    mousePos.current = { x: dx, y: dy };

    if (bgRef.current) {
      bgRef.current.style.transform = `translate(${dx * -5}px, ${dy * -5}px) scale(1.04)`;
    }
    if (midRef.current) {
      midRef.current.style.transform = `translate(${dx * -2.5}px, ${dy * -2.5}px)`;
    }
  }, []);

  return (
    <>
      {!isTouch && <CustomCursor />}

      <AnimatePresence>
        {showIntro && <CinematicIntro onDone={() => setShowIntro(false)} />}
      </AnimatePresence>


      <div
        className="relative min-h-screen overflow-hidden"
        onMouseMove={handleMouseMove}
        style={isTouch ? undefined : { cursor: "none" }}
      >
        {/* ── Hero Background (parallax layers) ──────────────────────── */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Layer 1 — image (most movement) */}
          <div
            ref={bgRef}
            className="absolute inset-[-3%] transition-transform duration-75 ease-out"
          >
            <img
              src={heroCityscape}
              alt="The Empire"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Layer 2 — mid gradient (medium movement) */}
          <div
            ref={midRef}
            className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out"
            style={{ background: "radial-gradient(ellipse at 40% 60%, hsl(38 72% 50% / 0.08) 0%, transparent 60%)" }}
          />
          {/* Layer 3 — static vignette gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
        </div>

        {/* Particles */}
        <div className="absolute inset-0 z-[2] pointer-events-none">
          <ParticleCanvas />
        </div>

        {/* ── Hero Content ────────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20 sm:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 30 : 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="text-xs tracking-[0.5em] text-primary/70 uppercase font-body mb-4">
              An Interactive World Experience
            </p>

            {/* Typewriter headline */}
            <h1 className="font-display text-[2rem] sm:text-7xl lg:text-8xl tracking-[0.08em] text-foreground leading-tight w-full max-w-full overflow-hidden">
              {/* Line 1 */}
              <span className="block pb-1">
                {line1.displayed}
                {!line1.done && <span className="typewriter-cursor">|</span>}
              </span>
              {/* Line 2 */}
              <span className="text-brass-glow block min-h-[1em] pb-1">
                {line1.done && line2.displayed}
                {line1.done && !line2.done && <span className="typewriter-cursor">|</span>}
              </span>
              {/* Line 3 */}
              <span className="block min-h-[1em] pb-1">
                {line2.done && line3.displayed}
                {line2.done && !line3.done && <span className="typewriter-cursor">|</span>}
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: line3.done ? 1 : 0 }}
            transition={{ duration: 1 }}
          >
            <p className="mt-8 font-narrative text-[1.0625rem] sm:text-xl text-foreground/70 italic max-w-lg mx-auto leading-[1.8] px-5 sm:px-0">
              "In the shadow of brass towers and steam-choked skies, an empire
              holds its breath. The fire below is rising."
            </p>
          </motion.div>

          {/* CTA buttons + QuestTrigger — single centered column */}
          <div className="mt-12 flex flex-col items-center gap-4 w-full px-6 sm:px-0">
            {/* Row 1: Enter + Meet — side by side on desktop, stacked on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: line3.done ? 1 : 0, y: line3.done ? 0 : 20 }}
              transition={{ duration: 0.8 }}
              className="w-full"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                <Link
                  to="/world"
                  className="btn-pulse-glow w-full sm:w-auto text-center min-h-[52px] flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-display text-sm tracking-[0.2em] uppercase transition-shadow"
                  style={isTouch ? undefined : { cursor: "none" }}
                >
                  Enter the Empire
                </Link>
                <Link
                  to="/characters"
                  className="w-full sm:w-auto text-center min-h-[52px] flex items-center justify-center px-8 py-3 border border-primary/40 text-foreground font-display text-sm tracking-[0.2em] uppercase hover:border-primary/80 transition-colors"
                  style={isTouch ? undefined : { cursor: "none" }}
                >
                  Meet the Players
                </Link>
              </div>
            </motion.div>

            {/* Row 2: QuestTrigger — centered below, full-width on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: line3.done ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full flex justify-center"
            >
              <QuestTrigger />
            </motion.div>
          </div>

          {/* Hidden Orb 1 — tucked near bottom-right of hero */}
          <HiddenOrb id={1} className="absolute bottom-24 right-5 sm:right-16" />

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: line3.done ? 1 : 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2 steam-rise">
              <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase font-body">
                Scroll to Explore
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* ── Below-fold sections (scroll reveal) ─────────────────────── */}
        <div className="relative z-10 bg-background">
          {/* World teaser */}
          <section className="py-16 sm:py-24 px-5 sm:px-4">
            <div className="max-w-4xl mx-auto text-center relative">
              {/* Hidden Orb 2 — blends into decorative divider */}
              <HiddenOrb id={2} className="absolute top-0 right-4 opacity-60" />
              <ScrollReveal>
                <div className="steampunk-divider max-w-xs mx-auto mb-8" />
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <h2 className="font-display text-2xl sm:text-3xl tracking-[0.1em] text-foreground">
                  A WORLD ON THE EDGE
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="mt-6 font-narrative text-[1.0625rem] sm:text-lg text-muted-foreground leading-[1.8] max-w-2xl mx-auto w-full">
                  The empire was built on steam and iron, on the bones of the conquered
                  and the dreams of the powerful. For three centuries, the Voss dynasty
                  has maintained order through a machine of control — military, political,
                  and technological. But the machine is breaking. The Lower Wards rumble
                  with revolution. The aristocracy plays its lethal games. And deep
                  beneath the capital, the fire that powers everything grows restless.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="steampunk-divider max-w-xs mx-auto mt-8" />
              </ScrollReveal>
            </div>
          </section>

          {/* Chronicles Scroll Collection */}
          <section className="py-16 sm:py-20 px-5 sm:px-8 border-t border-border/30">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-10">
                  <p className="font-display text-[9px] tracking-[0.4em] uppercase text-muted-foreground mb-2">
                    ✦ The Chronicles of Panterra ✦
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl tracking-[0.15em] text-foreground">
                    Fragments of Forbidden Truth
                  </h2>
                  <div className="steampunk-divider max-w-xs mx-auto mt-4" />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <ScrollCollection />
              </ScrollReveal>
            </div>
          </section>

          {/* Navigation Cards */}
          <section className="py-16 px-4 bg-secondary/30">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { to: "/world", title: "World Overview", desc: "Explore the empire's territories, culture, and power structures" },
                { to: "/characters", title: "Character Database", desc: "Discover the key figures shaping the fate of the world" },
                { to: "/timeline", title: "Timeline", desc: "Trace the events that brought the empire to the brink" },
                { to: "/factions", title: "Factions", desc: "Understand the powers vying for control" },
                { to: "/map", title: "World Map", desc: "Navigate the regions of the empire" },
                { to: "/gallery", title: "Visual Gallery", desc: "Cinematic visions of the world" },
              ].map((card, i) => (
                <ScrollReveal key={card.to} delay={i * 0.08}>
                  <Link
                    to={card.to}
                    className="block p-4 sm:p-6 bg-card border border-border hover:border-primary/40 transition-all hover:shadow-brass group"
                    style={isTouch ? undefined : { cursor: "none" }}
                  >
                    <h3 className="font-display text-sm tracking-[0.15em] text-primary group-hover:text-brass-glow transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-body">
                      {card.desc}
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* BottomNav is rendered globally in Layout.tsx */}
    </>
  );
};

export default Index;
