import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { HiddenOrb, useGame } from "@/components/ChroniclesSystem";
import VialSubstitutionGame, { VialSubstitutionTrigger } from "@/components/VialSubstitution";
import { characterImageMap } from "@/data/guide-images";
import { useIsMobile } from "@/hooks/use-mobile";
import panterraMap from "@/assets/panterra-map.jpg";
import { Plus, Minus, RotateCcw } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const ZOOM_STEP = 0.3;
const PINCH_DAMPEN = 0.4; // slow down pinch sensitivity

// ── Region accent colours ──────────────────────────────────────────────────────
// All regions use white at rest, brass when active — unified palette
const GLOW_WHITE = "#ffffff";
const GLOW_BRASS = "#d4a843";

const REGION_COLORS: Record<string, string> = {
  "sanctorium":    GLOW_BRASS,
  "parliament":    GLOW_BRASS,
  "deepforge":     GLOW_BRASS,
  "ocean-reaches": GLOW_BRASS,
  "ashfields":     GLOW_BRASS,
  "valorica":      GLOW_BRASS,
  "arborwell":     GLOW_BRASS,
};

// ── Characters per region ──────────────────────────────────────────────────────
const REGION_CHARACTERS: Record<string, { name: string; title: string; image: string }[]> = {
  "sanctorium": [
    { name: "Quinnevere",       title: "Pantheon Ivory Scholar",         image: "char-quinn"    },
    { name: "Carmela",          title: "Pantheon Lunary (Ivory)",         image: "char-carmela"  },
    { name: "Verlaine",         title: "Rising Shadow",                   image: "char-verlaine" },
    { name: "Gemma",            title: "Lunary Political Operator",       image: "char-gemma"    },
    { name: "Sol Deus Thema",   title: "Divine Ruler",                    image: "char-thema"    },
  ],
  "parliament": [
    { name: "Chief Magister Remsays", title: "Parliament Chief Magister",  image: "char-remsays" },
    { name: "Premiere Jude",          title: "Head of Parliament",         image: "char-jude"    },
    { name: "Cora",                   title: "Parliament Council Member",  image: "char-cora"    },
    { name: "Aspen",                  title: "Director of Peace, NE",      image: "char-aspen"   },
    { name: "Wintry",                 title: "Senior Council, Space Sci",  image: "char-wintry"  },
  ],
  "deepforge": [
    { name: "Sol Deus Thema",   title: "Keeper of the Deep Forge",        image: "char-thema"    },
    { name: "Culver Gretell",   title: "Paragon of Ocean Magistry",       image: "char-culver"   },
  ],
  "ocean-reaches": [
    { name: "Culver Gretell",   title: "Paragon - Field Operations",      image: "char-culver"   },
    { name: "Soleil",           title: "Field Specialist",                 image: "char-soleil"   },
  ],
  "ashfields": [
    { name: "Sailor",           title: "Frontier Survivor",               image: "char-sailor"   },
  ],
};

// ── 12 Pantheons ───────────────────────────────────────────────────────────────
const PANTHEONS = [
  { id: "prisma",     name: "Prisma",     quadrant: "Northeast", constellation: "Ram (Aries)",              solDeus: "Thema",     lunary: "Gemma Avinas X",           color: "#ffffff", mapPos: { top: "48%", left: "72%" } },
  { id: "greenwood",  name: "Greenwood",  quadrant: "Northeast", constellation: "Bull (Taurus)",            solDeus: "Gable",     lunary: "Kasen Welliver II",         color: "#ffffff", mapPos: { top: "44%", left: "78%" } },
  { id: "ivory",      name: "Ivory",      quadrant: "Northeast", constellation: "Fish (Pisces)",            solDeus: "Verlaine",  lunary: "Carmela Faraday VI",        color: "#ffffff", mapPos: { top: "52%", left: "82%" } },
  { id: "mist",       name: "Mist",       quadrant: "Southeast", constellation: "Lioness (Leo)",            solDeus: "Santos",    lunary: "Wolf Bode III",             color: "#ffffff", mapPos: { top: "82%", left: "74%" } },
  { id: "lighthouse", name: "Lighthouse", quadrant: "Southeast", constellation: "Spider (Cancer)",          solDeus: "Coster",    lunary: "Bristol Safo IX",           color: "#ffffff", mapPos: { top: "88%", left: "80%" } },
  { id: "ember",      name: "Ember",      quadrant: "Southeast", constellation: "Warrior (Virgo)",          solDeus: "Finley",    lunary: "Siena Blackridge IV",       color: "#ffffff", mapPos: { top: "78%", left: "82%" } },
  { id: "volcan",     name: "Volcan",     quadrant: "Southwest", constellation: "Scales (Libra)",           solDeus: "Shanren",   lunary: "Rizal Moresea II",          color: "#ffffff", mapPos: { top: "82%", left: "28%" } },
  { id: "rockfall",   name: "Rockfall",   quadrant: "Southwest", constellation: "Scorpion (Scorpio)",       solDeus: "Morrison",  lunary: "Vicente Penna Car XI",      color: "#ffffff", mapPos: { top: "74%", left: "22%" } },
  { id: "canvas",     name: "Canvas",     quadrant: "Southwest", constellation: "Archer (Sagittarius)",     solDeus: "Kotani",    lunary: "Nikolai Panaura III",       color: "#ffffff", mapPos: { top: "88%", left: "20%" } },
  { id: "hedron",     name: "Hedron",     quadrant: "Northwest", constellation: "Goat (Capricorn)",         solDeus: "Mexia",     lunary: "Iris Belmiteza V",          color: "#ffffff", mapPos: { top: "48%", left: "24%" } },
  { id: "lumin",      name: "Lumin",      quadrant: "Northwest", constellation: "Water Bearer (Aquarius)",  solDeus: "Nolyn",     lunary: "Nova Auburn IV",            color: "#ffffff", mapPos: { top: "54%", left: "18%" } },
  { id: "finnrare",   name: "Finnrare",   quadrant: "Northwest", constellation: "Sisters (Gemini)",         solDeus: "Norstrand", lunary: "Reza Centaris XII",         color: "#ffffff", mapPos: { top: "44%", left: "30%" } },
];

// ── Sub-region lore data ───────────────────────────────────────────────────────
const SUB_REGIONS = [
  {
    id: "sanctorium",
    name: "Sanctorium",
    description: "The vast knowledge-keeping complex where Pantheon Ivory scholars preserve ancient texts, dead languages, and sacred institutional memory. Access is strictly tiered. At its center stands the Grand Sanctuary — court of trials and seat of divine authority. The 12 Pantheons surround it, each aligned to a quadrant and a constellation.",
    faction: "Pantheon Ivory",
    features: ["The Ivory Vaults", "Dead Language Archives", "Grand Sanctuary", "12 Pantheon Halls", "Ceremony Courts"],
  },
  {
    id: "parliament",
    name: "Parliament",
    description: "The governing body of Panterra, responsible for law, resource allocation, and the management of all four quadrants. Parliament sits in permanent session. Its deliberations are not public. Its decisions are.",
    faction: "Republic Parliament",
    features: ["Council Chambers", "The Archive", "Premiere's Office", "Intelligence Division"],
  },
  {
    id: "deepforge",
    name: "The Deep Forge",
    description: "Below the visible world, the geothermal nexus that powers all of Panterra's systems. Ancient carvings predate the Republic. The Sol Deus order watches over it. Something about it is growing unstable.",
    faction: "Pantheon Sol Deus",
    features: ["Geothermal Vents", "Ancient Pre-Republic Carvings", "Oracle Chamber", "The Memory Pools"],
  },
  {
    id: "ocean-reaches",
    name: "The Ocean Reaches",
    description: "The degraded but vast ocean territories where Magistry of Ocean Paragon candidates work. Beautiful and haunting — what the world was before systems of control replaced natural order.",
    faction: "Magistry of Ocean",
    features: ["Research Stations", "Degraded Reef Systems", "Culver's Field Labs", "The Tide Markers"],
  },
  {
    id: "ashfields",
    name: "The Frontier Borderlands",
    description: "Beyond the Republic's governed edge — the world the maps leave out. Frontier survivors here know truths the institutions spend enormous energy hiding.",
    faction: "Frontier / Unaligned",
    features: ["Survivor Camps", "Pre-War Ruins", "Sailor's Routes", "Ungoverned Ocean Channels"],
  },
  {
    id: "valorica",
    name: "Valorica",
    description: "A secret island known only to the innermost circle of Arborwell. Its purpose is unknown to the Citizens of Panterra. Souls are said to be tested here — and not all of them return.",
    faction: "Unknown",
    features: ["Soul Testing Grounds", "Restricted Access", "No Public Record"],
  },
  {
    id: "arborwell",
    name: "Arborwell",
    description: "A territory beyond the mapped edge of Panterra. Its existence is denied by every institution. Its presence is felt by those who have looked long enough. What lives here has no name the Republic will speak aloud.",
    faction: "Unknown",
    features: ["Unmapped Territory", "No Official Record", "Beyond the Boundary"],
  },
];

// ── Hotspot positions (percentage-based) ──────────────────────────────────────
const HOTSPOT_POSITIONS: Record<string, React.CSSProperties> = {
  "sanctorium":    { top: "10%", left: "58%", width: "22%", height: "26%" },
  "parliament":    { top: "36%", left: "56%", width: "18%", height: "18%" },
  "deepforge":     { top: "50%", left: "36%", width: "20%", height: "26%" },
  "ocean-reaches": { top: "15%", left: "5%",  width: "24%", height: "38%" },
  "ashfields":     { top: "52%", left: "65%", width: "20%", height: "26%" },
};

const ARBORWELL_STYLE: React.CSSProperties  = { top: "72%", left: "18%", width: "18%", height: "20%" };
const VALORICA_STYLE: React.CSSProperties   = { top: "68%", left: "48%", width: "16%", height: "18%" };

// ── Region auto-zoom targets ────────────────────────────────────────────────────
const REGION_FOCUS: Record<string, { x: number; y: number }> = {
  "sanctorium":    { x: 0.65, y: 0.15 },
  "parliament":    { x: 0.65, y: 0.45 },
  "deepforge":     { x: 0.46, y: 0.60 },
  "ocean-reaches": { x: 0.14, y: 0.35 },
  "ashfields":     { x: 0.72, y: 0.65 },
  "valorica":      { x: 0.56, y: 0.72 },
  "arborwell":     { x: 0.25, y: 0.78 },
};

// (PanelContent removed — inlined into bottom panel)
// ── Clamp helper ───────────────────────────────────────────────────────────────
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// ── Main Component ─────────────────────────────────────────────────────────────
const WorldMap = () => {
  const { questCompleted, foundScrolls, foundScroll, valoricaRevealed } = useGame();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion,  setHoveredRegion]  = useState<string | null>(null);
  const [showOrbs,       setShowOrbs]       = useState(false);
  const [showPantheons,  setShowPantheons]  = useState(false);
  const [selectedOrb,    setSelectedOrb]    = useState<string | null>(null);
  const [selectedPantheon, setSelectedPantheon] = useState<string | null>(null);
  const [arborwellMsg,   setArborwellMsg]   = useState(false);
  
  const isMobile = useIsMobile();

  // Arborwell fully unlocked when all 12 scrolls collected
  const arborwellFullUnlock = foundScrolls.filter(id => id >= 1 && id <= 12).length >= 12;
  const arborwellUnlocked = arborwellFullUnlock;
  // Valorica only visible after the sealed document puzzle is solved
  const valoricaUnlocked  = valoricaRevealed;

  const selectedData = SUB_REGIONS.find((r) => r.id === selectedRegion) ?? null;

  // ── All live transform values live in refs — never in React state ────────────
  const scaleRef  = useRef(1);
  const txRef     = useRef(0);
  const tyRef     = useRef(0);
  const mapInnerRef = useRef<HTMLDivElement>(null);

  // ── Other refs ───────────────────────────────────────────────────────────────
  const containerRef    = useRef<HTMLDivElement>(null);
  const isDragging      = useRef(false);
  const hasDragged      = useRef(false);
  const dragStart       = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lastPinchDist   = useRef<number | null>(null);
  const lastPinchMid    = useRef<{ x: number; y: number } | null>(null);

  // ── Write transform directly to DOM (zero React overhead) ────────────────────
  const commitTransform = useCallback((s: number, x: number, y: number, animated: boolean) => {
    const prevScale = scaleRef.current;
    scaleRef.current = s;
    txRef.current    = x;
    tyRef.current    = y;
    // Only re-render on visibility threshold crossings
    const nowOrbs = s >= 1.5;
    const nowPanth = s >= 2;
    if ((prevScale >= 1.5) !== nowOrbs) setShowOrbs(nowOrbs);
    if ((prevScale >= 2) !== nowPanth) setShowPantheons(nowPanth);
    const el = mapInnerRef.current;
    if (!el) return;
    el.style.transition = animated
      ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
      : "none";
    el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  }, []);

  // ── Constrain panning ──────────────────────────────────────────────────────
  const constrain = useCallback((nextTx: number, nextTy: number, nextScale: number) => {
    const el = containerRef.current;
    if (!el) return { tx: nextTx, ty: nextTy };
    const { width: cw, height: ch } = el.getBoundingClientRect();
    const maxX = Math.max((cw * nextScale - cw) / 2, 0);
    const maxY = Math.max((ch * nextScale - ch) / 2, 0);
    return {
      tx: clamp(nextTx, -maxX, maxX),
      ty: clamp(nextTy, -maxY, maxY),
    };
  }, []);

  // ── Zoom math (cursor-anchored) ──────────────────────────────────────────────
  const zoomToward = useCallback(
    (delta: number, originX: number, originY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const { width: cw, height: ch } = el.getBoundingClientRect();
      const curScale = scaleRef.current;
      const nextScale = clamp(curScale + delta, MIN_SCALE, MAX_SCALE);
      if (nextScale === curScale) return;
      const imgX  = (originX - cw / 2 - txRef.current) / curScale;
      const imgY  = (originY - ch / 2 - tyRef.current) / curScale;
      const nextTx = originX - cw / 2 - imgX * nextScale;
      const nextTy = originY - ch / 2 - imgY * nextScale;
      const { tx: cx, ty: cy } = constrain(nextTx, nextTy, nextScale);
      commitTransform(nextScale, cx, cy, false);
    },
    [constrain, commitTransform]
  );

  // ── Programmatic animated zoom (region auto-zoom — max 30% above current) ──
  const zoomToRegion = useCallback((regionId: string) => {
    const el = containerRef.current;
    if (!el) return;
    const { width: cw, height: ch } = el.getBoundingClientRect();
    const focus = REGION_FOCUS[regionId];
    if (!focus) return;
    // Cap auto-zoom at +30% above current scale
    const curScale = scaleRef.current;
    const targetScale = clamp(curScale + ZOOM_STEP, MIN_SCALE, MAX_SCALE);
    const imgX = (focus.x - 0.5) * cw;
    const imgY = (focus.y - 0.5) * ch;
    const { tx: cx, ty: cy } = constrain(-imgX * targetScale, -imgY * targetScale, targetScale);
    commitTransform(targetScale, cx, cy, true);
  }, [constrain, commitTransform]);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetTransform = useCallback(() => {
    commitTransform(1, 0, 0, true);
    setSelectedRegion(null);
  }, [commitTransform]);

  // ── Toggle region ────────────────────────────────────────────────────────────
  const toggleRegion = useCallback((id: string) => {
    setSelectedOrb(null);
    setSelectedPantheon(null);
    setSelectedRegion((prev) => {
      if (prev === id) {
        commitTransform(1, 0, 0, true);
        return null;
      }
      return id;
    });
  }, [commitTransform]);

  useEffect(() => {
    if (selectedRegion) zoomToRegion(selectedRegion);
  }, [selectedRegion, zoomToRegion]);

  const closeRegion = useCallback(() => {
    setSelectedRegion(null);
    commitTransform(1, 0, 0, true);
  }, [commitTransform]);

  // ── Mouse drag ───────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragStart.current  = { x: e.clientX, y: e.clientY, tx: txRef.current, ty: tyRef.current };
    if (mapInnerRef.current) mapInnerRef.current.style.transition = "none";
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
      const { tx: cx, ty: cy } = constrain(dragStart.current.tx + dx, dragStart.current.ty + dy, scaleRef.current);
      txRef.current = cx;
      tyRef.current = cy;
      if (mapInnerRef.current) mapInnerRef.current.style.transform = `translate(${cx}px, ${cy}px) scale(${scaleRef.current})`;
    };
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, [constrain]);

  // ── Scroll wheel zoom ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect   = el.getBoundingClientRect();
      const delta  = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      zoomToward(delta, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomToward]);

  // ── Touch drag + pinch ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (mapInnerRef.current) mapInnerRef.current.style.transition = "none";
      if (e.touches.length === 1) {
        isDragging.current    = true;
        hasDragged.current    = false;
        const t = e.touches[0];
        dragStart.current     = { x: t.clientX, y: t.clientY, tx: txRef.current, ty: tyRef.current };
        lastPinchDist.current = null;
      } else if (e.touches.length === 2) {
        isDragging.current = false;
        const [a, b] = [e.touches[0], e.touches[1]];
        lastPinchDist.current = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        lastPinchMid.current  = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging.current) {
        const t  = e.touches[0];
        const dx = t.clientX - dragStart.current.x;
        const dy = t.clientY - dragStart.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
        const { tx: cx, ty: cy } = constrain(dragStart.current.tx + dx, dragStart.current.ty + dy, scaleRef.current);
        txRef.current = cx;
        tyRef.current = cy;
        if (mapInnerRef.current) mapInnerRef.current.style.transform = `translate(${cx}px, ${cy}px) scale(${scaleRef.current})`;
      } else if (e.touches.length === 2 && lastPinchDist.current) {
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist   = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        const mid    = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
        const ratio  = dist / lastPinchDist.current;
        const rect   = el.getBoundingClientRect();
        const rawDelta = (scaleRef.current * ratio) - scaleRef.current;
        zoomToward(rawDelta * PINCH_DAMPEN, mid.x - rect.left, mid.y - rect.top);
        lastPinchDist.current = dist;
        lastPinchMid.current  = mid;
      }
    };

    const onTouchEnd = () => {
      isDragging.current    = false;
      lastPinchDist.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [constrain, zoomToward]);

  // ── Button zoom handlers ─────────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const curScale = scaleRef.current;
    const nextScale = Math.min(curScale + ZOOM_STEP, MAX_SCALE);
    if (nextScale === curScale) return;
    const { tx: cx, ty: cy } = constrain(txRef.current, tyRef.current, nextScale);
    commitTransform(nextScale, cx, cy, true);
  }, [constrain, commitTransform]);

  const zoomOut = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const curScale = scaleRef.current;
    const nextScale = Math.max(curScale - ZOOM_STEP, MIN_SCALE);
    if (nextScale === curScale) return;
    const { tx: cx, ty: cy } = constrain(txRef.current, tyRef.current, nextScale);
    commitTransform(nextScale, cx, cy, true);
  }, [constrain, commitTransform]);

  // ── Cursor ───────────────────────────────────────────────────────────────────
  const onContainerMouseDown = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
    onMouseDown(e);
  }, [onMouseDown]);

  useEffect(() => {
    const reset = () => { if (containerRef.current) containerRef.current.style.cursor = "grab"; };
    window.addEventListener("mouseup", reset);
    return () => window.removeEventListener("mouseup", reset);
  }, []);

  return (
    <Layout>
      <div className="pt-20 pb-28 overflow-x-hidden bg-[#0f0b06] min-h-screen relative">
        {/* Hidden Orb 5 — Map page scroll */}
        <HiddenOrb id={5} className="absolute top-24 right-4 sm:right-12 z-20" />

        {/* ── Title ── */}
        <div className="text-center pt-4 pb-2 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-xl sm:text-2xl tracking-[0.2em] text-foreground"
          >
            Panterra - The Known World
          </motion.h1>
          <div className="steampunk-divider max-w-xs mx-auto mt-3" />
        </div>

        {/* ── Discovery status bar ── */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 mt-4 mb-3">
          <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center">
            <span className="font-body text-[9px] tracking-[0.25em] uppercase text-muted-foreground">
              Scrolls: {foundScrolls.filter(id => id >= 1 && id <= 12).length}/12
            </span>
            <span
              className="font-body text-[9px] tracking-[0.25em] uppercase"
              style={{ color: arborwellUnlocked ? GLOW_BRASS : "#6b7280" }}
            >
              {arborwellUnlocked ? (
                <><span style={{ textShadow: `0 0 8px rgba(212,168,67,0.6)` }}>✦ Arborwell</span></>
              ) : (
                <>◎ <span style={{ filter: "blur(3px)", userSelect: "none" }}>█████████</span> : Unknown</>
              )}
            </span>
          </div>
        </div>

        {/* ── Map + bottom panel wrapper ── */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
            {/* === MAP CONTAINER === */}
            <div
              ref={containerRef}
              className="relative w-full select-none overflow-hidden rounded bg-black"
              style={{ cursor: "grab", aspectRatio: "16 / 10" }}
              onMouseDown={onContainerMouseDown}
            >
              {/* Aspect-ratio lock via CSS aspect-ratio — never stretches */}
              <div style={{ width: "100%", height: "100%", position: "relative" }}>
              {/* ── Zoomable inner wrapper — transform written directly to DOM ── */}
              <div
                ref={mapInnerRef}
                style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, transformOrigin: "center center", willChange: "transform" }}
              >

                {/* Vignette */}
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)" }}
                />

                <img
                  src={panterraMap}
                  alt="Map of Panterra — The Known World"
                  className="w-full h-full object-contain block"
                  draggable={false}
                />

                {/* Continent pulse glow */}
                <motion.div
                  animate={{ opacity: [0.08, 0.18, 0.08] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 pointer-events-none z-[1]"
                  style={{ background: "radial-gradient(ellipse at 50% 50%, #c9a96e22 0%, transparent 65%)" }}
                />

                {/* === SUB-REGION HOTSPOTS === */}
                {SUB_REGIONS.filter((r) => !["valorica", "arborwell"].includes(r.id)).map((region) => {
                  const pos = HOTSPOT_POSITIONS[region.id];
                  if (!pos) return null;
                  const isSelected = selectedRegion === region.id;
                  const isHovered  = hoveredRegion  === region.id;
                  const dotColor = isSelected || isHovered ? GLOW_BRASS : GLOW_WHITE;
                  const glowColor = GLOW_BRASS;

                  return (
                    <div key={region.id} className="absolute z-20" style={pos}>
                      {/* Clickable invisible area */}
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={region.name}
                        onClick={(e) => {
                          if (!hasDragged.current) {
                            e.stopPropagation();
                            toggleRegion(region.id);
                          }
                        }}
                        onKeyDown={(e) => e.key === "Enter" && toggleRegion(region.id)}
                        onMouseEnter={() => setHoveredRegion(region.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute inset-0 cursor-pointer"
                      />

                      {/* Radial glow (replaces rectangle) */}
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full transition-all duration-700"
                        style={{
                          width:  isSelected ? "80%" : isHovered ? "50%" : "0%",
                          height: isSelected ? "80%" : isHovered ? "50%" : "0%",
                          background: `radial-gradient(circle, ${glowColor}30 0%, ${glowColor}10 40%, transparent 70%)`,
                          boxShadow: isSelected ? `0 0 40px ${glowColor}25, 0 0 80px ${glowColor}10` : isHovered ? `0 0 20px ${glowColor}15` : "none",
                          opacity: isSelected || isHovered ? 1 : 0,
                        }}
                      />

                      {/* Center dot — white at rest, brass on active */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <motion.span
                          animate={{
                            scale: isSelected ? [1.2, 1.6, 1.2] : [1, 1.6, 1],
                            opacity: [0.7, 0.2, 0.7],
                          }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          className="block rounded-full transition-all duration-300"
                          style={{
                            width:  isSelected ? 12 : 8,
                            height: isSelected ? 12 : 8,
                            background: dotColor,
                            boxShadow: isSelected ? `0 0 12px ${GLOW_BRASS}80` : `0 0 8px rgba(255,255,255,0.6)`,
                          }}
                        />
                      </div>

                      {/* Floating label */}
                      <AnimatePresence>
                        {(isHovered || isSelected) && (
                          <motion.div
                            key={region.id + "-label"}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-30"
                          >
                            <span
                              className="block bg-[#0f0b06]/90 font-display text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm whitespace-nowrap shadow-lg border"
                              style={{ color: GLOW_BRASS, borderColor: GLOW_BRASS + "50" }}
                            >
                              {region.name}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* === ARBORWELL — unknown until fully unlocked === */}
                <div className="absolute z-20" style={ARBORWELL_STYLE}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={arborwellFullUnlock ? "Arborwell" : "Unknown territory"}
                    onClick={() => {
                      if (!hasDragged.current) {
                        if (arborwellFullUnlock) {
                          toggleRegion("arborwell");
                        } else {
                          setArborwellMsg(true);
                          setTimeout(() => setArborwellMsg(false), 4000);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (arborwellFullUnlock) toggleRegion("arborwell");
                        else { setArborwellMsg(true); setTimeout(() => setArborwellMsg(false), 4000); }
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="relative w-full h-full cursor-pointer"
                  >
                    {/* Radial glow instead of rectangle */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full transition-all duration-700"
                      style={{
                        width: arborwellFullUnlock && selectedRegion === "arborwell" ? "80%" : "0%",
                        height: arborwellFullUnlock && selectedRegion === "arborwell" ? "80%" : "0%",
                        background: `radial-gradient(circle, ${GLOW_BRASS}30 0%, ${GLOW_BRASS}10 40%, transparent 70%)`,
                        boxShadow: selectedRegion === "arborwell" ? `0 0 40px ${GLOW_BRASS}25` : "none",
                        opacity: selectedRegion === "arborwell" ? 1 : 0,
                      }}
                    />
                    {/* Dim glow when locked */}
                    {!arborwellFullUnlock && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <motion.div
                          animate={{ opacity: [0.08, 0.2, 0.08] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="w-4 h-4 rounded-full"
                          style={{ background: GLOW_WHITE, filter: "blur(3px)" }}
                        />
                      </div>
                    )}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={arborwellFullUnlock ? "arborwell" : "unknown"}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.2 }}
                          className="block bg-[#0f0b06]/90 font-display text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm whitespace-nowrap shadow-lg border"
                          style={{
                            color: arborwellFullUnlock ? GLOW_BRASS : GLOW_WHITE,
                            borderStyle: arborwellFullUnlock ? "solid" : "dashed",
                            borderColor: arborwellFullUnlock ? GLOW_BRASS + "50" : "rgba(255,255,255,0.3)",
                          }}
                        >
                          {arborwellFullUnlock ? "Arborwell" : "Unknown"}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* === VALORICA === */}
                <AnimatePresence>
                  {valoricaUnlocked && (
                    <motion.div
                      key="valorica-hotspot"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute z-20"
                      style={VALORICA_STYLE}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Valorica"
                        onClick={(e) => {
                          if (!hasDragged.current) {
                            e.stopPropagation();
                            toggleRegion("valorica");
                          }
                        }}
                        onKeyDown={(e) => e.key === "Enter" && toggleRegion("valorica")}
                        onMouseEnter={() => setHoveredRegion("valorica")}
                        onMouseLeave={() => setHoveredRegion(null)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="relative w-full h-full cursor-pointer"
                      >
                        {/* Radial glow */}
                        <div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full transition-all duration-700"
                          style={{
                            width:  selectedRegion === "valorica" ? "80%" : hoveredRegion === "valorica" ? "50%" : "0%",
                            height: selectedRegion === "valorica" ? "80%" : hoveredRegion === "valorica" ? "50%" : "0%",
                            background: `radial-gradient(circle, ${REGION_COLORS.valorica}30 0%, ${REGION_COLORS.valorica}10 40%, transparent 70%)`,
                            boxShadow: selectedRegion === "valorica" ? `0 0 40px ${REGION_COLORS.valorica}25` : "none",
                            opacity: selectedRegion === "valorica" || hoveredRegion === "valorica" ? 1 : 0,
                          }}
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <motion.span
                            animate={{
                              scale: selectedRegion === "valorica" ? [1.2, 1.6, 1.2] : [1, 1.6, 1],
                              opacity: [0.7, 0.2, 0.7],
                            }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                            className="block rounded-full transition-all duration-300"
                            style={{
                              width: selectedRegion === "valorica" ? 12 : 8,
                              height: selectedRegion === "valorica" ? 12 : 8,
                              background: selectedRegion === "valorica" || hoveredRegion === "valorica" ? GLOW_BRASS : GLOW_WHITE,
                              boxShadow: selectedRegion === "valorica" ? `0 0 12px ${GLOW_BRASS}80` : `0 0 8px rgba(255,255,255,0.6)`,
                            }}
                          />
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-30">
                          <span
                            className="block bg-[#0f0b06]/90 font-display text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm whitespace-nowrap shadow-lg border"
                            style={{ color: GLOW_BRASS, borderColor: GLOW_BRASS + "50" }}
                          >
                            Valorica
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* === GRAND SANCTUARY ORB (visible at 1.5x+ zoom) === */}
                {showOrbs && (
                  <div className="absolute z-[25]" style={{ top: "23%", left: "69%", transform: "translate(-50%, -50%)" }}>
                    <button
                      onClick={(e) => { if (!hasDragged.current) { e.stopPropagation(); setSelectedOrb(selectedOrb === "grand-sanctuary" ? null : "grand-sanctuary"); setSelectedPantheon(null); } }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="relative w-3 h-3 cursor-pointer"
                      aria-label="Grand Sanctuary"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full rounded-full"
                        style={{ background: GLOW_BRASS, boxShadow: `0 0 10px ${GLOW_BRASS}80` }}
                      />
                    </button>
                  </div>
                )}

                {/* === PLAZA MONTECITO ORB (visible at 1.5x+ zoom) === */}
                {showOrbs && (
                  <div className="absolute z-[25]" style={{ top: "45%", left: "65%", transform: "translate(-50%, -50%)" }}>
                    <button
                      onClick={(e) => { if (!hasDragged.current) { e.stopPropagation(); setSelectedOrb(selectedOrb === "plaza-montecito" ? null : "plaza-montecito"); setSelectedPantheon(null); } }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="relative w-3 h-3 cursor-pointer"
                      aria-label="Plaza Montecito"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full rounded-full"
                        style={{ background: GLOW_BRASS, boxShadow: `0 0 10px ${GLOW_BRASS}80` }}
                      />
                    </button>
                  </div>
                )}

                {/* === 12 PANTHEON MARKERS (always visible) === */}
                {PANTHEONS.map((p) => {
                  const leftNum = parseFloat(p.mapPos.left);
                  const flipToLeft = leftNum > 75;
                  return (
                  <div key={p.id} className="absolute z-[25]" style={{ top: p.mapPos.top, left: p.mapPos.left, transform: "translate(-50%, -50%)" }}>
                    <button
                      onClick={(e) => { if (!hasDragged.current) { e.stopPropagation(); setSelectedPantheon(selectedPantheon === p.id ? null : p.id); setSelectedOrb(null); } }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="relative w-2 h-2 cursor-pointer group"
                      aria-label={`Pantheon ${p.name}`}
                    >
                      <div className="w-full h-full rounded-full transition-all duration-200 group-hover:scale-125" style={{ background: GLOW_WHITE, boxShadow: `0 0 8px rgba(255,255,255,0.6)` }} />
                      {/* Badge on hover */}
                      <div
                        className={`absolute bottom-full mb-1.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 ${flipToLeft ? 'right-1/2' : 'left-1/2'}`}
                        style={{ transform: flipToLeft ? 'translateX(50%)' : 'translateX(-50%)' }}
                      >
                        <div
                          className="px-2.5 py-1 rounded-sm whitespace-nowrap"
                          style={{
                            background: '#0a0804',
                            border: '1px solid #d4a84350',
                            boxShadow: '0 0 10px rgba(212,168,67,0.1)',
                          }}
                        >
                          <span className="block font-display text-[8px] tracking-[0.18em] uppercase" style={{ color: GLOW_BRASS }}>
                            {p.name}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                  );
                })}

              </div>{/* end zoomable wrapper */}
              </div>{/* end aspect-ratio lock */}

              {/* Unseen marker — outside zoomable, inside map container */}
              {typeof window !== "undefined" && localStorage.getItem("arborwell-hint-unlocked") === "true" && (
                <UnseenMarker />
              )}


              {/* ── Zoom controls (bottom-right) ── */}
              <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1.5">
                {/* + */}
                <button
                  onClick={zoomIn}
                  aria-label="Zoom in"
                  className="w-8 h-8 flex items-center justify-center border transition-all duration-200 rounded-sm"
                  style={{
                    background:  "rgba(10,8,4,0.85)",
                    borderColor: "hsl(38 40% 30% / 0.6)",
                    color:       "hsl(38 72% 55%)",
                    boxShadow:   "0 0 8px hsl(38 72% 50% / 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 60% 50% / 0.9)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px hsl(38 72% 50% / 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 40% 30% / 0.6)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 8px hsl(38 72% 50% / 0.15)";
                  }}
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>

                {/* − */}
                <button
                  onClick={zoomOut}
                  aria-label="Zoom out"
                  className="w-8 h-8 flex items-center justify-center border transition-all duration-200 rounded-sm"
                  style={{
                    background:  "rgba(10,8,4,0.85)",
                    borderColor: "hsl(38 40% 30% / 0.6)",
                    color:       "hsl(38 72% 55%)",
                    boxShadow:   "0 0 8px hsl(38 72% 50% / 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 60% 50% / 0.9)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px hsl(38 72% 50% / 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 40% 30% / 0.6)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 8px hsl(38 72% 50% / 0.15)";
                  }}
                >
                  <Minus size={13} strokeWidth={2.5} />
                </button>

                {/* Reset */}
                <button
                  onClick={resetTransform}
                  aria-label="Reset map view"
                  className="w-8 h-8 flex items-center justify-center border transition-all duration-200 rounded-sm"
                  style={{
                    background:  "rgba(10,8,4,0.85)",
                    borderColor: "hsl(38 40% 30% / 0.6)",
                    color:       "hsl(38 72% 55%)",
                    boxShadow:   "0 0 8px hsl(38 72% 50% / 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 60% 50% / 0.9)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px hsl(38 72% 50% / 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 40% 30% / 0.6)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 8px hsl(38 72% 50% / 0.15)";
                  }}
                >
                  <RotateCcw size={11} strokeWidth={2.5} />
                </button>
              </div>

            </div>{/* end map container */}

          {/* === REGION NAV BAR — always visible below map === */}
            <div className="mt-3">
              <div className="flex flex-wrap gap-2 justify-center pb-1">
                {SUB_REGIONS.filter((r) => r.id !== "valorica" && (r.id !== "arborwell" || arborwellFullUnlock)).map((r, i, arr) => {
                  const color = REGION_COLORS[r.id] ?? GLOW_BRASS;
                  const isActive = selectedRegion === r.id;
                  // Mobile: row 1 = first 3 (33% each), row 2 = last items (50% each)
                  const mobileWidth = i < 3
                    ? "w-[calc(33.333%-0.35rem)] sm:w-auto"
                    : "w-[calc(50%-0.25rem)] sm:w-auto";
                  return (
                    <button
                      key={r.id}
                      onClick={() => toggleRegion(r.id)}
                      className={`flex items-center justify-center gap-2 px-2 sm:px-3 py-2 border transition-all font-body text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase min-h-[44px] ${mobileWidth}`}
                      style={{
                        borderColor: isActive ? color : "rgba(255,255,255,0.1)",
                        color:       isActive ? color : "rgba(255,255,255,0.4)",
                        boxShadow:   isActive ? `0 0 12px ${color}40` : "none",
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: isActive ? GLOW_BRASS : GLOW_WHITE, boxShadow: isActive ? `0 0 8px rgba(212,168,67,0.6)` : `0 0 6px rgba(255,255,255,0.4)` }}
                      />
                      {r.name}
                    </button>
                  );
                })}
              </div>
            </div>

          {/* === BOTTOM PANEL — opens below nav bar on region click === */}
          <AnimatePresence>
            {selectedData && (
              <motion.div
                key={selectedData.id + "-bottom"}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3 }}
                className="relative w-full bg-[#0a0804] border-t-2 overflow-hidden"
                style={{
                  borderColor: (REGION_COLORS[selectedData.id] ?? GLOW_BRASS) + "60",
                  aspectRatio: "16 / 10",
                }}
              >
                {/* Close button — sticky top-right */}
                <button
                  onClick={closeRegion}
                  className="absolute top-3 right-3 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ color: GLOW_BRASS }}
                  aria-label="Close panel"
                >
                  <span className="text-lg font-display">✕</span>
                </button>

                {/* Scrollable interior — entire panel scrolls as one unit */}
                <div className="h-full overflow-y-auto map-panel-scroll p-5 pr-14">
                  {isMobile ? (
                    /* ── MOBILE: single column ── */
                    <>
                      <p className="font-body text-[9px] tracking-[0.25em] uppercase" style={{ color: REGION_COLORS[selectedData.id] ?? GLOW_BRASS, fontVariant: "small-caps" }}>
                        {selectedData.faction}
                      </p>
                      <h3 className="font-display text-xl tracking-wide text-foreground leading-tight mt-1">{selectedData.name}</h3>
                      <div className="h-px mt-3 mb-3" style={{ background: (REGION_COLORS[selectedData.id] ?? GLOW_BRASS) + "40" }} />
                      <p className="font-narrative italic text-[0.9375rem] text-foreground/90 leading-[1.8]">{selectedData.description}</p>

                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {selectedData.features.map((f) => (
                          <span key={f} className="bg-secondary/80 text-foreground/80 text-[9px] tracking-wider font-body px-2 py-1 border" style={{ borderColor: (REGION_COLORS[selectedData.id] ?? GLOW_BRASS) + "30" }}>{f}</span>
                        ))}
                      </div>

                      {(() => {
                        const characters = REGION_CHARACTERS[selectedData.id] ?? [];
                        if (!characters.length) return null;
                        return (
                          <div className="mt-4">
                            <p className="font-display text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2">Characters Here</p>
                            <div className="flex flex-col gap-2">
                              {characters.map((char) => (
                                <div key={char.name} className="flex items-center gap-3">
                                  <img src={characterImageMap[char.image]} alt={char.name} className="w-8 h-8 rounded-full object-cover border" style={{ borderColor: (REGION_COLORS[selectedData.id] ?? GLOW_BRASS) + "60" }} />
                                  <div>
                                    <p className="font-display text-[11px] tracking-wide text-foreground leading-tight">{char.name}</p>
                                    <p className="font-body text-[9px] text-muted-foreground tracking-wide">{char.title}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {selectedData.id === "sanctorium" && (
                        <div className="mt-4">
                          <p className="font-display text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-3">The 12 Pantheons</p>
                          {["Northeast", "Southeast", "Southwest", "Northwest"].map((q) => (
                            <div key={q} className="mb-4">
                              <p className="font-display text-[8px] tracking-[0.4em] uppercase mb-2" style={{ color: GLOW_BRASS }}>{q}</p>
                              <div className="flex flex-col gap-2">
                                {PANTHEONS.filter((p) => p.quadrant === q).map((p) => (
                                  <div key={p.id} className="pl-2 border-l" style={{ borderColor: GLOW_BRASS + "60" }}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-display text-[10px] tracking-wide text-foreground">{p.name}</span>
                                      <span className="font-body text-[8px] text-muted-foreground">{p.constellation}</span>
                                    </div>
                                    <p className="font-body text-[8px] text-muted-foreground/70">Sol Deus: {p.solDeus}</p>
                                    <p className="font-body text-[8px] text-muted-foreground/70">Lunary: {p.lunary}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    /* ── DESKTOP: two columns with brass divider ── */
                    <div className="flex gap-0 min-h-0">
                      {/* Left column — tag, name, description */}
                      <div className="w-1/2 pr-5">
                        <p className="font-body text-[9px] tracking-[0.25em] uppercase" style={{ color: REGION_COLORS[selectedData.id] ?? GLOW_BRASS, fontVariant: "small-caps" }}>
                          {selectedData.faction}
                        </p>
                        <h3 className="font-display text-xl tracking-wide text-foreground leading-tight mt-1">{selectedData.name}</h3>
                        <div className="h-px mt-3 mb-3" style={{ background: (REGION_COLORS[selectedData.id] ?? GLOW_BRASS) + "40" }} />
                        <p className="font-narrative italic text-[0.9375rem] text-foreground/90 leading-[1.8]">{selectedData.description}</p>
                      </div>

                      {/* Brass vertical divider */}
                      <div className="w-px self-stretch flex-shrink-0" style={{ background: `${GLOW_BRASS}40` }} />

                      {/* Right column — features, characters, pantheons */}
                      <div className="w-1/2 pl-5">
                        <div className="flex flex-wrap gap-1.5">
                          {selectedData.features.map((f) => (
                            <span key={f} className="bg-secondary/80 text-foreground/80 text-[9px] tracking-wider font-body px-2 py-1 border" style={{ borderColor: (REGION_COLORS[selectedData.id] ?? GLOW_BRASS) + "30" }}>{f}</span>
                          ))}
                        </div>

                        {(() => {
                          const characters = REGION_CHARACTERS[selectedData.id] ?? [];
                          if (!characters.length) return null;
                          return (
                            <div className="mt-4">
                              <p className="font-display text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2">Characters Here</p>
                              <div className="flex flex-col gap-2">
                                {characters.map((char) => (
                                  <div key={char.name} className="flex items-center gap-3">
                                    <img src={characterImageMap[char.image]} alt={char.name} className="w-8 h-8 rounded-full object-cover border" style={{ borderColor: (REGION_COLORS[selectedData.id] ?? GLOW_BRASS) + "60" }} />
                                    <div>
                                      <p className="font-display text-[11px] tracking-wide text-foreground leading-tight">{char.name}</p>
                                      <p className="font-body text-[9px] text-muted-foreground tracking-wide">{char.title}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {selectedData.id === "sanctorium" && (
                          <div className="mt-4">
                            <p className="font-display text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-3">The 12 Pantheons</p>
                            {["Northeast", "Southeast", "Southwest", "Northwest"].map((q) => (
                              <div key={q} className="mb-4">
                                <p className="font-display text-[8px] tracking-[0.4em] uppercase mb-2" style={{ color: GLOW_BRASS }}>{q}</p>
                                <div className="flex flex-col gap-2">
                                  {PANTHEONS.filter((p) => p.quadrant === q).map((p) => (
                                    <div key={p.id} className="pl-2 border-l" style={{ borderColor: GLOW_BRASS + "60" }}>
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-display text-[10px] tracking-wide text-foreground">{p.name}</span>
                                        <span className="font-body text-[8px] text-muted-foreground">{p.constellation}</span>
                                      </div>
                                      
                                      <p className="font-body text-[8px] text-muted-foreground/70">Sol Deus: {p.solDeus}</p>
                                      <p className="font-body text-[8px] text-muted-foreground/70">Lunary: {p.lunary}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>{/* end max-w wrapper */}
      </div>

      {/* === ORB TOOLTIP OVERLAY === */}
      <AnimatePresence>
        {selectedOrb && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedOrb(null)}
          >
            <div
              className="bg-[#0a0804]/95 border p-5 max-w-sm"
              style={{ borderColor: selectedOrb === "grand-sanctuary" ? REGION_COLORS.sanctorium + "50" : REGION_COLORS.parliament + "50" }}
              onClick={(e) => e.stopPropagation()}
            >
              <p
                className="font-body text-[8px] tracking-[0.3em] uppercase mb-2"
                style={{ color: selectedOrb === "grand-sanctuary" ? REGION_COLORS.sanctorium : REGION_COLORS.parliament }}
              >
                {selectedOrb === "grand-sanctuary" ? "Sanctorium" : "Parliament"}
              </p>
              <h4 className="font-display text-sm tracking-wide text-foreground mb-2">
                {selectedOrb === "grand-sanctuary" ? "The Grand Sanctuary" : "Plaza Montecito"}
              </h4>
              <p className="font-narrative italic text-[0.875rem] leading-[1.8] text-foreground/70">
                {selectedOrb === "grand-sanctuary"
                  ? "Court of trials and seat of divine authority. Access is tiered. Most who enter do not reach the center."
                  : "The public face of Parliament governance. Ceremonies, announcements, and executions all happen here. The crowd is always managed."}
              </p>
              <button
                onClick={() => setSelectedOrb(null)}
                className="mt-3 font-body text-[8px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === PANTHEON MINI PANEL OVERLAY === */}
      <AnimatePresence>
        {selectedPantheon && (() => {
          const p = PANTHEONS.find(x => x.id === selectedPantheon);
          if (!p) return null;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              onClick={() => setSelectedPantheon(null)}
            >
              <div
                className="bg-[#0a0804]/95 border p-5 max-w-xs"
                style={{ borderColor: p.color + "50" }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="font-body text-[8px] tracking-[0.3em] uppercase mb-1" style={{ color: p.color }}>
                  Pantheon · {p.quadrant}
                </p>
                <h4 className="font-display text-sm tracking-wide text-foreground mb-2">{p.name}</h4>
                <div className="flex flex-col gap-1 text-[10px] font-body text-foreground/70">
                  <p><span className="text-muted-foreground">Constellation:</span> {p.constellation}</p>
                  
                  <p><span className="text-muted-foreground">Sol Deus:</span> {p.solDeus}</p>
                  <p><span className="text-muted-foreground">Lunary:</span> {p.lunary}</p>
                </div>
                <button
                  onClick={() => setSelectedPantheon(null)}
                  className="mt-3 font-body text-[8px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* === ARBORWELL LOCKED MESSAGE === */}
      <AnimatePresence>
        {arborwellMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setArborwellMsg(false)}
          >
            <div className="bg-[#0a0804]/95 border border-[#6b728040] p-6 max-w-sm text-center">
              <p className="font-narrative italic text-[0.9375rem] leading-[1.8] text-foreground/60">
                "This location is not recognized. It does not appear on any Parliament map."
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === THE KNOWN INSTITUTIONS === */}
      <KnownInstitutions />

      {/* Vial Substitution game section */}
      <div className="px-4">
        <VialSubstitutionGame onClose={() => {}} />
      </div>
    </Layout>
  );
};

export default WorldMap;

// ── Known Institutions Section ─────────────────────────────────────────────────
const QUADRANTS = [
  {
    label: "NORTHWEST",
    magistry: "Magistry of Cure",
    magistryDesc: "Medical systems, biological research, and Citizen health",
    magistryCharacters: ["Cora"],
    pantheons: [
      { name: "Hedron", constellation: "Sailor (Aquarius)", solDeus: "Mexia" },
      { name: "Lumin", constellation: "Siren (Capricorn)", solDeus: "Nolyn" },
      { name: "Finnrare", constellation: "Sisters (Gemini)", solDeus: "Norstrand" },
    ],
  },
  {
    label: "NORTHEAST",
    magistry: "Magistry of Peace",
    magistryDesc: "Civil order, conflict resolution, and border enforcement",
    magistryCharacters: ["Aspen"],
    pantheons: [
      { name: "Prisma", constellation: "Ram (Aries)", solDeus: "Thema" },
      { name: "Greenwood", constellation: "Bull (Taurus)", solDeus: "Gable" },
      { name: "Ivory", constellation: "Vixens (Pisces)", solDeus: "Lockland" },
    ],
  },
  {
    label: "SOUTHWEST",
    magistry: "Magistry of Ocean",
    magistryDesc: "Ocean recovery, marine research, and field operations",
    magistryCharacters: ["Culver", "Soleil"],
    pantheons: [
      { name: "Volcan", constellation: "Merchant (Libra)", solDeus: "Shanren" },
      { name: "Rockfall", constellation: "Scorpion (Scorpio)", solDeus: "Morrison" },
      { name: "Canvas", constellation: "Archer (Sagittarius)", solDeus: "Kotani" },
    ],
  },
  {
    label: "SOUTHEAST",
    magistry: "Magistry of Stars",
    magistryDesc: "Satellite systems, atmospheric monitoring, and boundary maintenance",
    magistryCharacters: ["Wintry"],
    pantheons: [
      { name: "Mist", constellation: "Lioness (Leo)", solDeus: "Santos" },
      { name: "Lighthouse", constellation: "Spider (Cancer)", solDeus: "Coster" },
      { name: "Ember", constellation: "Warrior (Virgo)", solDeus: "Finley" },
    ],
  },
];


const KnownInstitutions = () => (
  <section className="px-4 sm:px-8 pb-20 pt-4 max-w-6xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-16"
    >
      <div className="steampunk-divider max-w-xs mx-auto mb-6" />
      <h2 className="font-display text-3xl sm:text-4xl tracking-[0.1em] text-foreground">
        THE KNOWN INSTITUTIONS
      </h2>
      <p className="mt-4 text-muted-foreground font-narrative text-lg italic max-w-2xl mx-auto">
        Twelve Pantheons. Four Magistries. One Republic.
      </p>
      <div className="steampunk-divider max-w-xs mx-auto mt-6" />
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
      {QUADRANTS.map((q, qi) => (
        <motion.div
          key={q.label}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: qi * 0.1 }}
        >
          {/* Quadrant label */}
          <p className="font-body text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-4">
            {q.label}
          </p>

          {/* Magistry card */}
          <div className="border-2 border-primary/40 bg-card/80 p-4 mb-5 shadow-brass">
            <h3 className="font-display text-base sm:text-lg tracking-wide text-primary mb-1">
              {q.magistry}
            </h3>
            <p className="font-narrative italic text-sm text-foreground/70 mb-2">
              {q.magistryDesc}
            </p>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Key: {q.magistryCharacters.join(", ")}
            </p>
          </div>

          {/* Pantheon cards */}
          <div className="flex flex-col gap-3">
            {q.pantheons.map((p) => (
                <div
                  key={p.name}
                  className="border border-primary/20 bg-card/60 p-3 transition-shadow duration-300 hover:shadow-glow"
                >
                  <h4 className="font-display text-sm tracking-wide text-foreground">
                    {p.name}
                  </h4>
                  <p className="font-body text-[9px] tracking-[0.25em] uppercase text-primary/70 mt-1">
                    {p.constellation}
                  </p>
                  <p className="font-body text-[9px] text-muted-foreground mt-0.5">
                    Sol Deus: {p.solDeus}
                  </p>
                </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>

    {/* Footnote */}
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="font-narrative italic text-sm text-foreground/40 text-center mt-14 max-w-2xl mx-auto leading-relaxed"
    >
      The Grand Sanctuary and Parliament buildings are located in the Northeast quadrant. Pantheon Ivory and Pantheon Prisma are considered the most politically connected of the twelve.
    </motion.p>
  </section>
);

// ── Unseen Marker (far right edge of map) ─────────────────────────────────────
const UnseenMarker = () => {
  const { foundScrolls, foundScroll } = useGame();
  const [showMessage, setShowMessage] = useState(false);
  const hasScroll6 = foundScrolls.includes(6);

  const handleClick = () => {
    if (!hasScroll6) {
      foundScroll(6);
    }
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 5000);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="absolute z-30 cursor-pointer"
        style={{ top: "45%", right: "2%", width: 16, height: 16 }}
        aria-label="Unknown marker"
      >
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full rounded-full"
          style={{ background: "hsl(38 72% 50%)", boxShadow: "0 0 12px hsl(38 72% 50% / 0.4)" }}
        />
      </button>
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-40 p-4 border max-w-xs"
            style={{ top: "35%", right: "2%", background: "hsl(20 12% 7% / 0.95)", borderColor: "hsl(38 50% 35% / 0.4)" }}
          >
            <p className="font-narrative italic text-[0.875rem] leading-[1.8]" style={{ color: "hsl(38 30% 65%)" }}>
              "Something exists beyond the boundary. It has no name on this map. It has always been there."
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

