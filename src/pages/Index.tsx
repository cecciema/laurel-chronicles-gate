import { Link, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import GoldDivider from "@/components/GoldDivider";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { QuestTrigger, ScrollCollection, useGame } from "@/components/ChroniclesSystem";
import ParticleCanvas from "@/components/ParticleCanvas";
import heroBg from "@/assets/hero-enter.jpeg";
import BottomHero from "@/components/BottomHero";
import bottomHeroBg from "@/assets/bottom-hero-enter.jpeg";
import { isTouch } from "@/components/CustomCursor";
import { BESTIARY_ENABLED } from "@/config/features";

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


// ─── Main Component ────────────────────────────────────────────────────────────
const Index = () => {
  const navigate = useNavigate();
  const showIntro = false;
  const mousePos = useRef({ x: 0, y: 0 });
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);

  // Headline typewriter - starts after intro fades (2.6s) + small gap
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
        className="relative overflow-hidden"
        onMouseMove={handleMouseMove}
        style={isTouch ? undefined : { cursor: "none" }}
      >
        {/* ── Hero Background (parallax layers) ──────────────────────── */}
        <div className="relative w-full z-0 bg-background min-h-[80vh] sm:min-h-screen">
          {/* Layer 1 - image (parallax + slow haze drift) */}
          <div
            ref={bgRef}
            className="absolute inset-0 z-0 transition-transform duration-75 ease-out"
          >
            <div className="absolute inset-0 haze-drift">
              <img
                src={heroBg}
                alt="The Republic"
                className="w-full h-full object-cover"
                style={{ filter: "saturate(0.55) brightness(0.7) contrast(1.05) hue-rotate(-15deg)" }}
              />
              {/* Cool color-grade — multiply ember-violet + halcyon-teal over warm gold image */}
              <div className="absolute inset-0 pointer-events-none hero-cool-grade" />
              <div className="absolute inset-0 pointer-events-none hero-cool-grade-overlay" />
            </div>
          </div>
          {/* Layer 2 - jewel-tone atmospheric wash */}
          <div
            ref={midRef}
            className="absolute inset-0 z-[1] pointer-events-none transition-transform duration-100 ease-out atmos-jewel"
          />
          {/* Top + bottom mist fade */}
          <div className="absolute inset-0 z-[2] pointer-events-none atmos-mist-overlay" />
          {/* Vignette */}
          <div className="absolute inset-0 z-[3] pointer-events-none atmos-vignette" />
          {/* Film grain */}
          <div className="absolute inset-0 z-[3] pointer-events-none atmos-grain" />
          {/* Bottom fade into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-[14%] z-[3] pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)" }} />

          {/* Particles */}
          <ParticleCanvas />

          {/* ── Hero Content ────────────────────────────────────────────── */}
          <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center sm:justify-end pt-[14vh] sm:pt-24 pb-6 sm:pb-10 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 30 : 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            >
              <p className="font-ui text-[9px] sm:text-xs tracking-[0.5em] sm:tracking-[0.55em] uppercase mb-3 sm:mb-6" style={{ color: "hsl(var(--silver) / 0.6)" }}>
                An Interactive World Experience
              </p>

              {/* Typewriter headline — thin silver Cormorant */}
              <h1
                className="font-serif-display text-[2rem] sm:text-7xl lg:text-[7.5rem] tracking-[0.16em] sm:tracking-[0.22em] leading-[1.05] w-full max-w-full overflow-hidden"
                style={{
                  fontWeight: 300,
                  color: "hsl(var(--silver))",
                  textShadow: "0 0 28px hsl(var(--silver) / 0.25), 0 0 70px hsl(var(--silver) / 0.12), 0 2px 14px hsl(250 22% 4% / 0.6)",
                }}
              >
                <span className="block pb-1">
                  {line1.displayed}
                  {!line1.done && <span className="typewriter-cursor" style={{ WebkitTextFillColor: "initial" }}>|</span>}
                </span>
                <span className="block min-h-[1em] pb-1">
                  {line1.done && line2.displayed}
                  {line1.done && !line2.done && <span className="typewriter-cursor" style={{ WebkitTextFillColor: "initial" }}>|</span>}
                </span>
                <span className="block min-h-[1em] pb-1">
                  {line2.done && line3.displayed}
                  {line2.done && !line3.done && <span className="typewriter-cursor" style={{ WebkitTextFillColor: "initial" }}>|</span>}
                </span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: line3.done ? 1 : 0 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            >
              <p
                className="mt-5 sm:mt-10 font-serif-display italic text-[0.95rem] sm:text-2xl max-w-2xl mx-auto leading-[1.6] sm:leading-[1.7] px-5 sm:px-0"
                style={{
                  fontWeight: 300,
                  letterSpacing: "0.03em",
                  color: "hsl(var(--vellum) / 0.78)",
                  textShadow: "0 1px 18px hsl(250 22% 4% / 0.55)",
                }}
              >
                "The Republic has no secrets. The records are complete. The ceremonies are sacred. You were not supposed to find this."
              </p>
            </motion.div>

            {/* CTA buttons + QuestTrigger — thin silver outlined, candlelight on hover */}
            <div className="mt-6 sm:mt-12 flex flex-col items-center gap-3 sm:gap-5 w-full px-6 sm:px-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: line3.done ? 1 : 0, y: line3.done ? 0 : 20 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="w-full"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center w-full">
                  <Link
                    to="/world"
                    className="btn-silver-outline w-full sm:w-auto text-center min-h-[46px] sm:min-h-[52px] flex items-center justify-center px-8 sm:px-10 py-2.5 sm:py-3 font-serif-display text-[11px] sm:text-sm tracking-[0.28em] sm:tracking-[0.32em] uppercase rounded-[2px]"
                    style={isTouch ? undefined : { cursor: "none" }}
                  >
                    Enter the Republic
                  </Link>
                  <Link
                    to="/characters"
                    className="btn-silver-outline w-full sm:w-auto text-center min-h-[46px] sm:min-h-[52px] flex items-center justify-center px-8 sm:px-10 py-2.5 sm:py-3 font-serif-display text-[11px] sm:text-sm tracking-[0.28em] sm:tracking-[0.32em] uppercase rounded-[2px]"
                    style={isTouch ? undefined : { cursor: "none" }}
                  >
                    Meet the Players
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: line3.done ? 1 : 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="w-full flex justify-center"
              >
                <QuestTrigger />
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: line3.done ? 1 : 0 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="mt-5 sm:mt-10"
            >
              <div className="flex flex-col items-center gap-2 mist-rise">
                <span className="font-ui text-[10px] tracking-[0.4em] uppercase" style={{ color: "hsl(var(--silver) / 0.85)" }}>
                  Scroll to Explore
                </span>
                <div className="w-px h-8 sm:h-10" style={{ background: "linear-gradient(to bottom, hsl(var(--silver) / 0.7), transparent)" }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Below-fold sections (scroll reveal) ─────────────────────── */}
        <div className="relative z-10 bg-background">
          {/* World teaser */}
          <section className="py-16 sm:py-24 px-5 sm:px-4" style={{ background: "radial-gradient(ellipse at center, rgba(120, 90, 30, 0.06) 0%, transparent 70%)" }}>
            <div className="max-w-4xl mx-auto text-center relative">
              <ScrollReveal>
                <GoldDivider className="max-w-xs mx-auto mb-8" />
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <h2 className="font-display text-2xl sm:text-3xl tracking-[0.1em] text-foreground">
                  A WORLD ON THE EDGE
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="mt-6 font-narrative text-[1.0625rem] sm:text-lg text-muted-foreground leading-[1.8] max-w-2xl mx-auto w-full">
                  Solterra was built on the Cornerstone Laws, the bones of the conquered, and the dreams of the powerful. For nearly three centuries, the Republic has maintained order through the Dual Reign: Parliament, which governs the body through its Magistries, and Sanctorium, which governs the soul. But there are signs of fracture within the order - growing more difficult to ignore by the day. The governed districts rumble with unrest, and yet the powerful still play their lethal games. All around the Known World, whispers of defiance are simmering into an uproar.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <GoldDivider className="max-w-xs mx-auto mt-8" />
              </ScrollReveal>
            </div>
          </section>

          {/* Chronicles Scroll Collection */}
          <section className="py-16 sm:py-20 px-5 sm:px-8 border-t border-border/30">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-10">
                  <p className="font-display text-[9px] tracking-[0.4em] uppercase mb-3" style={{ color: "hsl(var(--silver) / 0.55)" }}>
                    <span className="mx-2" style={{ letterSpacing: "0" }}>·</span>
                    The Chronicles of Solterra
                    <span className="mx-2" style={{ letterSpacing: "0" }}>·</span>
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl tracking-[0.2em]" style={{ color: "hsl(var(--silver))", fontWeight: 300 }}>
                    Fragments of Forbidden Truth
                  </h2>
                  <GoldDivider className="max-w-xs mx-auto mt-4" />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <ScrollCollection />
              </ScrollReveal>
            </div>
          </section>


          {/* Navigation Cards — carved-stone archive plates */}
          <section className="py-16 px-4" style={{ background: "hsl(var(--stone-deep) / 0.5)" }}>
            <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
              {[
                { to: "/world", title: "World Overview", desc: "Explore the Republic's territories, culture, and power structures" },
                { to: "/characters", title: "Character Database", desc: "Discover the key figures shaping the fate of the world" },
                { to: "/timeline", title: "Timeline", desc: "Trace the events that brought the Republic to the brink" },
                { to: "/map", title: "Continent", desc: "Navigate the four quadrants of the Republic" },
                { to: "/manuscript", title: "Manuscript", desc: "Read the first six chapters of the novel" },
              ].map((card, i) => (
                <ScrollReveal
                  key={card.to}
                  delay={i * 0.08}
                  className={`h-full ${card.to === "/manuscript" ? "col-span-2 lg:col-span-1" : ""}`}
                >
                  <Link
                    to={card.to}
                    className="archive-plate block h-full p-5 sm:p-6 flex flex-col items-center justify-center text-center"
                    style={isTouch ? undefined : { cursor: "none" }}
                  >
                    <h3 className="font-display text-sm tracking-[0.18em] uppercase transition-colors" style={{ color: "hsl(var(--silver))", fontWeight: 400 }}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-xs sm:text-sm font-body leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {card.desc}
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
          <BottomHero src={bottomHeroBg} alt="Solterra lounge" />
          <Footer />
        </div>
      </div>

      <EasterEggGlyph />
      <ResetProgressButton />

      {/* BottomNav is rendered globally in Layout.tsx */}
    </>
  );
};


// ── Easter egg glyph - awards Scroll 6 + navigates to bestiary ────────────────
const EasterEggGlyph = () => {
  const navigate = useNavigate();
  const { foundScroll } = useGame();

  const handleClick = () => {
    foundScroll(6);
    if (BESTIARY_ENABLED) navigate("/bestiary");
  };

  return (
    <button
      onClick={handleClick}
      aria-hidden="true"
      tabIndex={-1}
      className="fixed bottom-[70px] sm:bottom-3 left-3 z-[5] w-6 h-6 flex items-center justify-center select-none"
      style={{ opacity: 0.15, cursor: "default" }}
    >
      <span className="font-display text-base" style={{ color: "hsl(38 30% 40%)" }}>◆</span>
    </button>
  );
};

// ── Hidden reset button - clears all game progress ────────────────────────────
const ResetProgressButton = () => {
  const handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/");
  };

  return (
    <button
      onClick={handleReset}
      className="fixed bottom-[70px] sm:bottom-3 right-3 z-[130] font-ui text-[9px] tracking-[0.25em] uppercase transition-colors"
      style={{
        opacity: 0.55,
        border: "1px solid hsl(var(--silver) / 0.4)",
        padding: "4px 12px",
        color: "hsl(var(--silver) / 0.8)",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      Clear Progress
    </button>
  );
};

export default Index;
