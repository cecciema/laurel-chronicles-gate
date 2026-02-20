import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { QuestTrigger, ScrollCollection, useGame } from "@/components/ChroniclesSystem";
import heroCityscape from "@/assets/hero-cityscape.jpg";
import { isTouch } from "@/components/CustomCursor";

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
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false);
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
              alt="The Republic"
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
              "The Republic has no secrets. The records are complete. The ceremonies are sacred. You were not supposed to find this."
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
                  Enter the Republic
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
                  The Republic was built on steam and iron, on the bones of the conquered
                  and the dreams of the powerful. For three centuries, the Republic
                  has maintained order through a machine of control — military, political,
                  and technological. But the machine is breaking. The governed districts rumble
                  with unrest. The powerful play their lethal games. And deep
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
            <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { to: "/world", title: "World Overview", desc: "Explore the Republic's territories, culture, and power structures" },
                { to: "/characters", title: "Character Database", desc: "Discover the key figures shaping the fate of the world" },
                { to: "/timeline", title: "Timeline", desc: "Trace the events that brought the Republic to the brink" },
                { to: "/map", title: "World Map", desc: "Navigate the regions of the Republic" },
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
          <Footer />
        </div>
      </div>

      <EasterEggGlyph />
      <ResetProgressButton />

      {/* BottomNav is rendered globally in Layout.tsx */}
    </>
  );
};

// ── Easter egg glyph — awards Scroll 6 + navigates to bestiary ────────────────
const EasterEggGlyph = () => {
  const navigate = useNavigate();
  const { foundScroll } = useGame();
  
  const handleClick = () => {
    foundScroll(6);
    navigate("/bestiary");
  };

  return (
    <button
      onClick={handleClick}
      aria-hidden="true"
      tabIndex={-1}
      className="fixed bottom-3 left-3 z-[5] w-6 h-6 flex items-center justify-center select-none"
      style={{ opacity: 0.15, cursor: "default" }}
    >
      <span className="font-display text-base" style={{ color: "hsl(38 30% 40%)" }}>✦</span>
    </button>
  );
};

// ── Hidden reset button — clears all game progress ────────────────────────────
const ResetProgressButton = () => {
  const handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/");
  };

  return (
    <button
      onClick={handleReset}
      className="fixed bottom-3 right-3 z-[9999] font-display text-[9px] tracking-[0.15em] uppercase"
      style={{
        opacity: 0.5,
        border: "1px solid rgba(184, 150, 12, 0.6)",
        padding: "4px 12px",
        color: "hsl(38 60% 55%)",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      Clear Progress
    </button>
  );
};

export default Index;
