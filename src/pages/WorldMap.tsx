import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { HiddenOrb, useGame } from "@/components/ChroniclesSystem";
import { worldRegions } from "@/data/world-data";
import { characterImageMap } from "@/data/guide-images";
import { useIsMobile } from "@/hooks/use-mobile";
import panterraMap from "@/assets/panterra-map.jpg";
import { Plus, Minus, RotateCcw } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.4;

// ── Region accent colours ──────────────────────────────────────────────────────
const REGION_COLORS: Record<string, string> = {
  "sanctorium":    "#c9a96e",
  "deepforge":     "#e8640a",
  "ocean-reaches": "#0ea5c9",
  "ashfields":     "#6b7280",
  "valorica":      "#d4a832",
};

// ── Characters per region ──────────────────────────────────────────────────────
const REGION_CHARACTERS: Record<string, { name: string; title: string; image: string }[]> = {
  "sanctorium": [
    { name: "Quinnevere",       title: "Pantheon Ivory Scholar",         image: "char-quinn"    },
    { name: "Carmela",          title: "Pantheon Lunary (Ivory)",         image: "char-carmela"  },
    { name: "Verlaine",         title: "Rising Shadow",                   image: "char-verlaine" },
    { name: "Gemma",            title: "Lunary Political Operator",       image: "char-gemma"    },
    { name: "Sol Deus Nefertar",title: "Divine Ruler",                    image: "char-nefertar" },
  ],
  "deepforge": [
    { name: "Sol Deus Nefertar",title: "Keeper of the Deep Forge",        image: "char-nefertar" },
    { name: "Culver Gretell",   title: "Paragon of Ocean Magistry",       image: "char-culver"   },
  ],
  "ocean-reaches": [
    { name: "Culver Gretell",   title: "Paragon — Field Operations",      image: "char-culver"   },
    { name: "Soleil",           title: "Field Specialist",                 image: "char-soleil"   },
  ],
  "ashfields": [
    { name: "Sailor",           title: "Frontier Survivor",               image: "char-sailor"   },
  ],
};

// ── 12 Pantheons ───────────────────────────────────────────────────────────────
const PANTHEONS = [
  { id: "prisma",     name: "Prisma",     quadrant: "Northeast", specialty: "Sculpture",          constellation: "Ram (Aries)",       solDeus: "Nefertar",  lunary: "Gemma Avinas X",           color: "#9b72cf" },
  { id: "greenwood",  name: "Greenwood",  quadrant: "Northeast", specialty: "Mapmaking",          constellation: "Bull (Taurus)",     solDeus: "Gable",     lunary: "Kasen Welliver II",         color: "#4a7c59" },
  { id: "finnrare",   name: "Finnrare",   quadrant: "Northeast", specialty: "Masonry",            constellation: "Sisters (Gemini)",  solDeus: "Norstrand", lunary: "Reza Centaris XII",         color: "#7a9e9f" },
  { id: "mist",       name: "Mist",       quadrant: "Southeast", specialty: "Vocal",              constellation: "Lioness (Leo)",     solDeus: "Santos",    lunary: "Wolf Bode III",             color: "#8eb4c8" },
  { id: "lighthouse", name: "Lighthouse", quadrant: "Southeast", specialty: "Language",           constellation: "Spider (Cancer)",   solDeus: "Coster",    lunary: "Bristol Safo IX",           color: "#c9a96e" },
  { id: "ember",      name: "Ember",      quadrant: "Southeast", specialty: "Music Instruments",  constellation: "Warrior (Virgo)",   solDeus: "Finley",    lunary: "Siena Blackridge IV",       color: "#e8640a" },
  { id: "volcan",     name: "Volcan",     quadrant: "Southwest", specialty: "Breathing",          constellation: "Merchant (Libra)",  solDeus: "Shanren",   lunary: "Rizal Moresea II",          color: "#b5451b" },
  { id: "rockfall",   name: "Rockfall",   quadrant: "Southwest", specialty: "Stone",              constellation: "Scorpion (Scorpio)",solDeus: "Morrison",  lunary: "Vicente Penna Car XI",      color: "#7a6a5a" },
  { id: "canvas",     name: "Canvas",     quadrant: "Southwest", specialty: "Religious Studies",  constellation: "Archer (Sagittarius)",solDeus:"Kotani",   lunary: "Nikolai Panaura III",       color: "#c4a35a" },
  { id: "ivory",      name: "Ivory",      quadrant: "Northwest", specialty: "Paintings",          constellation: "Vixens (Pisces)",   solDeus: "Verlaine",  lunary: "Carmela Faraday VI",        color: "#e8e0c8" },
  { id: "hedron",     name: "Hedron",     quadrant: "Northwest", specialty: "Fauna",              constellation: "Sailor (Aquarius)", solDeus: "Mexia",     lunary: "Iris Belmiteza V",          color: "#5a8a7a" },
  { id: "lumin",      name: "Lumin",      quadrant: "Northwest", specialty: "Flora",              constellation: "Siren (Capricorn)", solDeus: "Nolyn",     lunary: "Nova Auburn IV",            color: "#7a9a4a" },
];

// ── Sub-region lore data ───────────────────────────────────────────────────────
const SUB_REGIONS = [
  {
    id: "sanctorium",
    name: "The Sanctorium",
    description: "The vast knowledge-keeping complex where Pantheon Ivory scholars preserve ancient texts, dead languages, and sacred institutional memory. Access is strictly tiered. At its center stands the Grand Sanctuary — court of trials and seat of divine authority. The 12 Pantheons surround it, each aligned to a quadrant and a constellation.",
    faction: "Pantheon Ivory",
    features: ["The Ivory Vaults", "Dead Language Archives", "Grand Sanctuary", "12 Pantheon Halls", "Ceremony Courts"],
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
    description: "A secret island known only to the innermost circle of Arborwell. Its purpose is unknown to the citizens of Panterra. Souls are said to be tested here — and not all of them return.",
    faction: "Unknown",
    features: ["Soul Testing Grounds", "Restricted Access", "No Public Record"],
  },
];

// ── Hotspot positions (percentage-based) ──────────────────────────────────────
const HOTSPOT_POSITIONS: Record<string, React.CSSProperties> = {
  "sanctorium":    { top: "10%", left: "58%", width: "22%", height: "26%" },
  "deepforge":     { top: "50%", left: "36%", width: "20%", height: "26%" },
  "ocean-reaches": { top: "15%", left: "5%",  width: "24%", height: "38%" },
  "ashfields":     { top: "52%", left: "65%", width: "20%", height: "26%" },
};

const ARBORWELL_STYLE: React.CSSProperties  = { top: "72%", left: "18%", width: "18%", height: "20%" };
const VALORICA_STYLE: React.CSSProperties   = { top: "68%", left: "48%", width: "16%", height: "18%" };

// ── Region auto-zoom targets (used for programmatic zoom-to-region) ────────────
// Values are the focal point as fractions of the image (0–1)
const REGION_FOCUS: Record<string, { x: number; y: number }> = {
  "sanctorium":    { x: 0.65, y: 0.15 },
  "deepforge":     { x: 0.46, y: 0.60 },
  "ocean-reaches": { x: 0.14, y: 0.35 },
  "ashfields":     { x: 0.72, y: 0.65 },
  "valorica":      { x: 0.56, y: 0.72 },
  "arborwell":     { x: 0.25, y: 0.78 },
};

// ── PanelContent ──────────────────────────────────────────────────────────────
const PanelContent = ({
  region,
  onClose,
}: {
  region: typeof SUB_REGIONS[0];
  onClose: () => void;
}) => {
  const characters = REGION_CHARACTERS[region.id] ?? [];
  const isSanctorium = region.id === "sanctorium";
  const quadrants = ["Northeast", "Southeast", "Southwest", "Northwest"];
  const accentColor = REGION_COLORS[region.id] ?? "#c9a96e";

  return (
    <div className="flex flex-col bg-[#0a0804] h-full">
      {/* Fixed close button header */}
      <div className="flex-shrink-0 flex items-center justify-between pb-3 bg-[#0a0804]">
        <p
          className="font-body text-[9px] tracking-[0.25em] uppercase"
          style={{ color: accentColor }}
        >
          {region.faction}
        </p>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto map-panel-scroll flex flex-col gap-4 pr-1">
        <div>
          <h3 className="font-display text-xl tracking-wide text-foreground leading-tight">
            {region.name}
          </h3>
          <div className="h-px mt-3 mb-3" style={{ background: accentColor + "40" }} />
          <p className="font-narrative italic text-[0.9375rem] text-foreground/90 leading-[1.8]">
            {region.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {region.features.map((f) => (
            <span
              key={f}
              className="bg-secondary/80 text-foreground/80 text-[9px] tracking-wider font-body px-2 py-1 border"
              style={{ borderColor: accentColor + "30" }}
            >
              {f}
            </span>
          ))}
        </div>

        {characters.length > 0 && (
          <div>
            <p className="font-display text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Characters Here
            </p>
            <div className="flex flex-col gap-2">
              {characters.map((char) => (
                <div key={char.name} className="flex items-center gap-3">
                  <img
                    src={characterImageMap[char.image]}
                    alt={char.name}
                    className="w-8 h-8 rounded-full object-cover border"
                    style={{ borderColor: accentColor + "60" }}
                  />
                  <div>
                    <p className="font-display text-[11px] tracking-wide text-foreground leading-tight">
                      {char.name}
                    </p>
                    <p className="font-body text-[9px] text-muted-foreground tracking-wide">
                      {char.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSanctorium && (
          <div>
            <p className="font-display text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
              The 12 Pantheons
            </p>
            {quadrants.map((q) => (
              <div key={q} className="mb-4">
                <p className="font-display text-[8px] tracking-[0.4em] uppercase mb-2" style={{ color: accentColor }}>
                  {q}
                </p>
                <div className="flex flex-col gap-2">
                  {PANTHEONS.filter((p) => p.quadrant === q).map((p) => (
                    <div
                      key={p.id}
                      className="pl-2 border-l"
                      style={{ borderColor: p.color + "60" }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-display text-[10px] tracking-wide text-foreground">{p.name}</span>
                        <span className="font-body text-[8px] text-muted-foreground">{p.constellation}</span>
                      </div>
                      <p className="font-body text-[8px] text-muted-foreground">{p.specialty}</p>
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
  );
};

// ── Clamp helper ───────────────────────────────────────────────────────────────
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// ── Main Component ─────────────────────────────────────────────────────────────
const WorldMap = () => {
  const { questCompleted, foundScrolls, foundScroll, valoricaRevealed } = useGame();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion,  setHoveredRegion]  = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Arborwell unlocked when ≥3 scrolls found or scroll 6 found
  const arborwellUnlocked = foundScrolls.length >= 3 || foundScrolls.includes(6);
  // Valorica only visible after the sealed document puzzle is solved
  const valoricaUnlocked  = valoricaRevealed;

  const selectedData = SUB_REGIONS.find((r) => r.id === selectedRegion) ?? null;

  // ── All live transform values live in refs — never in React state ────────────
  // This is the key to 60fps: drag/scroll/pinch write directly to the DOM
  // without triggering a React re-render.
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
    scaleRef.current = s;
    txRef.current    = x;
    tyRef.current    = y;
    const el = mapInnerRef.current;
    if (!el) return;
    el.style.transition = animated
      ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
      : "none";
    el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  }, []);

  // ── Constrain so map always fills container (no black gaps) ──────────────────
  const constrain = useCallback((nextTx: number, nextTy: number, nextScale: number) => {
    const el = containerRef.current;
    if (!el) return { tx: nextTx, ty: nextTy };
    const { width: cw, height: ch } = el.getBoundingClientRect();
    const maxX = (cw * nextScale - cw) / 2;
    const maxY = (ch * nextScale - ch) / 2;
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

  // ── Programmatic animated zoom (region auto-zoom) ────────────────────────────
  const zoomToRegion = useCallback((regionId: string) => {
    const el = containerRef.current;
    if (!el) return;
    const { width: cw, height: ch } = el.getBoundingClientRect();
    const focus = REGION_FOCUS[regionId];
    if (!focus) return;
    const targetScale = isMobile ? 2 : 2.4;
    const imgX = (focus.x - 0.5) * cw;
    const imgY = (focus.y - 0.5) * ch;
    const { tx: cx, ty: cy } = constrain(-imgX * targetScale, -imgY * targetScale, targetScale);
    commitTransform(targetScale, cx, cy, true);
  }, [isMobile, constrain, commitTransform]);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetTransform = useCallback(() => {
    commitTransform(1, 0, 0, true);
    setSelectedRegion(null);
  }, [commitTransform]);

  // ── Toggle region ────────────────────────────────────────────────────────────
  const toggleRegion = useCallback((id: string) => {
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
    // Kill transition so drag is instant
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
        zoomToward((scaleRef.current * ratio) - scaleRef.current, mid.x - rect.left, mid.y - rect.top);
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
    const { width: cw, height: ch } = el.getBoundingClientRect();
    const curScale = scaleRef.current;
    const nextScale = Math.min(curScale + ZOOM_STEP, MAX_SCALE);
    if (nextScale === curScale) return;
    const { tx: cx, ty: cy } = constrain(txRef.current, tyRef.current, nextScale);
    commitTransform(nextScale, cx, cy, true);
  }, [constrain, commitTransform]);

  const zoomOut = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width: cw, height: ch } = el.getBoundingClientRect();
    const curScale = scaleRef.current;
    const nextScale = Math.max(curScale - ZOOM_STEP, MIN_SCALE);
    if (nextScale === curScale) return;
    const { tx: cx, ty: cy } = constrain(txRef.current, tyRef.current, nextScale);
    commitTransform(nextScale, cx, cy, true);
  }, [constrain, commitTransform]);

  // ── Cursor (no re-render needed — use CSS class on container ref) ─────────────
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
      <div className="pt-20 pb-28 overflow-x-hidden bg-[#0f0b06] min-h-screen">

        {/* ── Title ── */}
        <div className="text-center pt-4 pb-2 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-xl sm:text-2xl tracking-[0.2em] text-foreground"
          >
            Panterra — The Known World
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
              style={{ color: arborwellUnlocked ? "#c9a96e" : "#6b7280" }}
            >
              {arborwellUnlocked ? "✦ Arborwell: Identity Revealed" : "◎ Arborwell: Unknown"}
            </span>
            <span
              className="font-body text-[9px] tracking-[0.25em] uppercase"
              style={{ color: valoricaUnlocked ? REGION_COLORS.valorica : "#6b7280" }}
            >
              {valoricaUnlocked ? "✦ Valorica: Accessible" : "◎ Valorica: Hidden"}
            </span>
          </div>
        </div>

        {/* ── Map + panel wrapper ── */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <div className="flex flex-row items-stretch gap-0">

            {/* === MAP CONTAINER === */}
            <div
              ref={containerRef}
              className="flex-1 relative min-w-0 select-none overflow-hidden rounded"
              style={{ minHeight: isMobile ? 400 : 600, cursor: "grab" }}
              onMouseDown={onContainerMouseDown}
            >
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
                  className="w-full h-full object-cover block"
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
                {SUB_REGIONS.filter((r) => r.id !== "valorica").map((region) => {
                  const pos = HOTSPOT_POSITIONS[region.id];
                  if (!pos) return null;
                  const isSelected = selectedRegion === region.id;
                  const isHovered  = hoveredRegion  === region.id;
                  const color = REGION_COLORS[region.id] ?? "#c9a96e";

                  return (
                    <div key={region.id} className="absolute z-20" style={pos}>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={region.name}
                        onClick={(e) => {
                          // Only trigger if it was a click, not end of drag
                          if (!hasDragged.current) {
                            e.stopPropagation();
                            toggleRegion(region.id);
                          }
                        }}
                        onKeyDown={(e) => e.key === "Enter" && toggleRegion(region.id)}
                        onMouseEnter={() => setHoveredRegion(region.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        onMouseDown={(e) => e.stopPropagation()} // prevent drag starting from hotspot
                        className="absolute inset-0 cursor-pointer rounded-sm transition-all duration-300"
                        style={{
                          border:     `2px solid ${isSelected ? color : isHovered ? color + "99" : "transparent"}`,
                          background: isSelected ? color + "30" : isHovered ? color + "15" : "transparent",
                          boxShadow:  isSelected ? `0 0 25px ${color}40` : "none",
                        }}
                      />

                      {/* Pulse dot */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <motion.span
                          animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0.2, 0.7] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          className="block w-2 h-2 rounded-full"
                          style={{ background: color }}
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
                              style={{ color, borderColor: color + "50" }}
                            >
                              {region.name}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* === ARBORWELL — region panel only, no scroll award === */}
                <div className="absolute z-20" style={ARBORWELL_STYLE}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={arborwellUnlocked ? "Arborwell" : "Unknown territory"}
                    onClick={() => { if (!hasDragged.current) toggleRegion("arborwell"); }}
                    onKeyDown={(e) => e.key === "Enter" && toggleRegion("arborwell")}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="relative w-full h-full cursor-pointer"
                  >
                    <div
                      className="absolute inset-0 rounded-sm border border-dashed transition-all duration-300"
                      style={{ borderColor: foundScrolls.includes(6) ? "#6b728099" : "#6b728060", background: "#6b728010" }}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <span
                        className="block bg-[#0f0b06]/90 font-display text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm whitespace-nowrap shadow-lg border border-dashed"
                        style={{ color: "#6b7280", borderColor: "#6b728050" }}
                      >
                        {arborwellUnlocked ? "Arborwell" : "Unknown"}
                      </span>
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
                        className="relative w-full h-full cursor-pointer rounded-sm transition-all duration-300"
                        style={{
                          border:     `2px solid ${selectedRegion === "valorica" ? REGION_COLORS.valorica : hoveredRegion === "valorica" ? REGION_COLORS.valorica + "99" : REGION_COLORS.valorica + "60"}`,
                          background: selectedRegion === "valorica" ? REGION_COLORS.valorica + "30" : hoveredRegion === "valorica" ? REGION_COLORS.valorica + "15" : REGION_COLORS.valorica + "08",
                          boxShadow:  selectedRegion === "valorica" ? `0 0 25px ${REGION_COLORS.valorica}40` : "none",
                        }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <motion.span
                            animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0.2, 0.7] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                            className="block w-2 h-2 rounded-full"
                            style={{ background: REGION_COLORS.valorica }}
                          />
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-30">
                          <span
                            className="block bg-[#0f0b06]/90 font-display text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm whitespace-nowrap shadow-lg border"
                            style={{ color: REGION_COLORS.valorica, borderColor: REGION_COLORS.valorica + "50" }}
                          >
                            Valorica
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>{/* end zoomable wrapper */}


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

            {/* === DESKTOP SIDE PANEL === */}
            <AnimatePresence>
              {selectedData && !isMobile && (
                <motion.div
                  key={selectedData.id + "-desktop"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="hidden sm:block w-80 flex-shrink-0 bg-[#0a0804] border-l-2 p-5 max-h-[80vh] flex flex-col"
                  style={{
                    borderColor: REGION_COLORS[selectedData.id] ?? "#c9a96e",
                  }}
                >
                  <PanelContent region={selectedData} onClose={closeRegion} />
                </motion.div>
              )}
            </AnimatePresence>

          </div>{/* end flex row */}
        </div>{/* end max-w wrapper */}

        {/* === REGION LEGEND BUTTONS === */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 mt-5">
          <div className="flex flex-wrap gap-2 justify-center">
            {SUB_REGIONS.filter((r) => r.id !== "valorica").map((r) => {
              const color = REGION_COLORS[r.id] ?? "#c9a96e";
              const isActive = selectedRegion === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRegion(r.id)}
                  className="flex items-center gap-2 px-3 py-2 border transition-all font-body text-[10px] tracking-[0.2em] uppercase min-h-[44px]"
                  style={{
                    borderColor: isActive ? color : "rgba(255,255,255,0.1)",
                    color:       isActive ? color : "rgba(255,255,255,0.4)",
                    boxShadow:   isActive ? `0 0 12px ${color}40` : "none",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  {r.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* === MOBILE SLIDE-UP PANEL === */}
      <AnimatePresence>
        {selectedData && isMobile && (
          <motion.div
            key={selectedData.id + "-mobile"}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-[60px] left-0 right-0 z-50 bg-[#0a0804] border-t p-5 flex flex-col"
            style={{
              borderColor: (REGION_COLORS[selectedData.id] ?? "#c9a96e") + "40",
              maxHeight:   "65vh",
            }}
          >
            <PanelContent region={selectedData} onClose={closeRegion} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          THE KNOWN WORLD — placement game
      ══════════════════════════════════════════════════════════════════════ */}
      <TheKnownWorld />

    </Layout>
  );
};

export default WorldMap;

// ─────────────────────────────────────────────────────────────────────────────
// THE KNOWN WORLD — placement mini-game
// ─────────────────────────────────────────────────────────────────────────────

const KNOWN_WORLD_SCROLL_ID = 11;
const KW_TOTAL_ROUNDS = 5;
const KW_TOTAL_LIVES  = 3;

// The four clickable zones the player can place characters into
type ZoneId = "sanctorium" | "ocean-reaches" | "frontier" | "deepforge";

const KW_ZONES: { id: ZoneId; label: string; color: string }[] = [
  { id: "sanctorium",    label: "The Sanctorium",        color: "#c9a96e" },
  { id: "deepforge",     label: "The Deep Forge",        color: "#e8640a" },
  { id: "ocean-reaches", label: "The Ocean Reaches",     color: "#0ea5c9" },
  { id: "frontier",      label: "Frontier Borderlands",  color: "#6b7280" },
];

type KWRound = {
  charName:  string;
  imageKey:  string;
  answer:    ZoneId;
};

const KW_ROUNDS: KWRound[] = [
  { charName: "Culver Gretell",      imageKey: "char-culver",   answer: "ocean-reaches" },
  { charName: "Sol Deus Nefertar",   imageKey: "char-nefertar", answer: "sanctorium"    },
  { charName: "Sailor",              imageKey: "char-sailor",   answer: "frontier"       },
  { charName: "Gemma Avinas X",      imageKey: "char-gemma",   answer: "sanctorium"    },
  { charName: "Sol Deus Kotani",     imageKey: "guide-kotani", answer: "sanctorium"    },
];

// CSS keyframes injected once
const KW_STYLES = `
@keyframes kw-drift {
  0%   { transform: translate(-12%, 8%) scaleX(1); opacity: 0.18; filter: blur(6px); }
  25%  { transform: translate(5%, -5%) scaleX(0.97); opacity: 0.28; filter: blur(8px); }
  50%  { transform: translate(18%, 10%) scaleX(1.02); opacity: 0.22; filter: blur(7px); }
  75%  { transform: translate(8%, 20%) scaleX(0.98); opacity: 0.30; filter: blur(9px); }
  100% { transform: translate(-12%, 8%) scaleX(1); opacity: 0.18; filter: blur(6px); }
}
@keyframes kw-drift-2 {
  0%   { transform: translate(30%, 5%) scaleX(0.96); opacity: 0.20; filter: blur(7px); }
  33%  { transform: translate(10%, 22%) scaleX(1.03); opacity: 0.14; filter: blur(9px); }
  66%  { transform: translate(42%, 15%) scaleX(0.99); opacity: 0.26; filter: blur(6px); }
  100% { transform: translate(30%, 5%) scaleX(0.96); opacity: 0.20; filter: blur(7px); }
}
@keyframes kw-drift-3 {
  0%   { transform: translate(50%, 50%) scale(1); opacity: 0.35; filter: blur(10px); }
  50%  { transform: translate(45%, 45%) scale(1.06); opacity: 0.55; filter: blur(12px); }
  100% { transform: translate(50%, 50%) scale(1); opacity: 0.35; filter: blur(10px); }
}
@keyframes kw-flash {
  0%   { opacity: 0; }
  20%  { opacity: 0.9; }
  60%  { opacity: 0.7; }
  100% { opacity: 0; }
}
@keyframes kw-snap {
  0%   { transform: scale(0.85); opacity: 0; }
  60%  { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
`;

// The Lost — pure CSS ghost figure
const LostFigure = ({ wrongCount }: { wrongCount: number }) => {
  if (wrongCount === 0) return null;
  const reachedCenter = wrongCount >= 3;

  return (
    <>
      {/* First apparition */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          inset: 0,
          animation: "kw-drift 14s ease-in-out infinite",
          willChange: "transform, opacity",
        }}
      >
        {/* Elongated figure silhouette */}
        <svg
          viewBox="0 0 40 90"
          width="40" height="90"
          style={{ position: "absolute", top: "10%", left: "5%", fill: "white", opacity: 0.85 }}
        >
          <ellipse cx="20" cy="12" rx="10" ry="11" />
          <path d="M8 25 Q10 60 6 90 L14 90 L16 55 L20 62 L24 55 L26 90 L34 90 Q30 60 32 25 Z" />
          <path d="M8 35 Q2 48 4 56 L10 52 Q8 44 12 38 Z" />
          <path d="M32 35 Q38 48 36 56 L30 52 Q32 44 28 38 Z" />
        </svg>
      </div>

      {/* Second apparition (after 2 wrong) */}
      {wrongCount >= 2 && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            inset: 0,
            animation: "kw-drift-2 18s ease-in-out infinite",
            willChange: "transform, opacity",
          }}
        >
          <svg
            viewBox="0 0 40 90"
            width="34" height="78"
            style={{ position: "absolute", top: "30%", right: "10%", fill: "white", opacity: 0.75 }}
          >
            <ellipse cx="20" cy="12" rx="9" ry="10" />
            <path d="M9 25 Q11 58 7 88 L15 88 L17 54 L20 60 L23 54 L25 88 L33 88 Q29 58 31 25 Z" />
          </svg>
        </div>
      )}

      {/* Center convergence (3 wrong — game over state) */}
      {reachedCenter && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            inset: 0,
            animation: "kw-drift-3 6s ease-in-out infinite",
          }}
        >
          <svg
            viewBox="0 0 60 120"
            width="60" height="120"
            style={{ position: "absolute", top: "25%", left: "35%", fill: "white", opacity: 0.9 }}
          >
            <ellipse cx="30" cy="16" rx="14" ry="15" />
            <path d="M12 35 Q14 80 9 120 L21 120 L24 72 L30 82 L36 72 L39 120 L51 120 Q46 80 48 35 Z" />
            <path d="M12 48 Q3 65 5 76 L15 70 Q12 59 18 50 Z" />
            <path d="M48 48 Q57 65 55 76 L45 70 Q48 59 42 50 Z" />
          </svg>
        </div>
      )}
    </>
  );
};

// Zone button inside the game map
const ZoneButton = ({
  zone,
  onClick,
  disabled,
  placedChar,
}: {
  zone: typeof KW_ZONES[0];
  onClick: () => void;
  disabled: boolean;
  placedChar?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="relative flex flex-col items-center justify-center gap-1.5 p-3 border transition-all duration-200 group focus:outline-none"
    style={{
      borderColor: placedChar ? zone.color : `${zone.color}40`,
      background:  placedChar ? `${zone.color}18` : "transparent",
      boxShadow:   placedChar ? `0 0 20px ${zone.color}40` : "none",
    }}
    onMouseEnter={(e) => {
      if (!disabled && !placedChar) {
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${zone.color}99`;
        (e.currentTarget as HTMLButtonElement).style.background  = `${zone.color}12`;
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled && !placedChar) {
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${zone.color}40`;
        (e.currentTarget as HTMLButtonElement).style.background  = "transparent";
      }
    }}
  >
    {/* Placed portrait snap-in */}
    {placedChar && (
      <div
        className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
        style={{ borderColor: zone.color, animation: "kw-snap 0.5s ease-out forwards" }}
      >
        <img src={characterImageMap[placedChar]} alt="" className="w-full h-full object-cover" />
      </div>
    )}
    {/* Colour pip */}
    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: zone.color }} />
    <span
      className="font-display text-[9px] tracking-[0.18em] uppercase text-center leading-tight"
      style={{ color: placedChar ? zone.color : `${zone.color}99` }}
    >
      {zone.label}
    </span>
    {!placedChar && !disabled && (
      <span className="text-[7px] tracking-widest uppercase font-body opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: zone.color }}>
        Place here
      </span>
    )}
  </button>
);

// ── Main game component ──────────────────────────────────────────────────────
const TheKnownWorld = () => {
  const { foundScrolls, awardScroll } = useGame();
  const alreadyWon = foundScrolls.includes(KNOWN_WORLD_SCROLL_ID);
  const [bestiaryUnlocked, setBestiaryUnlocked] = useState(alreadyWon);

  // Game state
  const [roundIdx,    setRoundIdx]    = useState(0);
  const [lives,       setLives]       = useState(KW_TOTAL_LIVES);
  const [wrongCount,  setWrongCount]  = useState(0); // total wrongs this game (controls Lost)
  const [placedZones, setPlacedZones] = useState<Partial<Record<ZoneId, string>>>({}); // zones with confirmed portraits
  const [gamePhase,   setGamePhase]   = useState<"playing" | "wrong-flash" | "lost" | "won">("playing");

  const currentRound = KW_ROUNDS[roundIdx];

  const fullReset = () => {
    setRoundIdx(0);
    setLives(KW_TOTAL_LIVES);
    setWrongCount(0);
    setPlacedZones({});
    setGamePhase("playing");
  };

  const handlePlace = (zoneId: ZoneId) => {
    if (gamePhase !== "playing" || !currentRound) return;

    if (zoneId === currentRound.answer) {
      // Correct placement
      const newPlaced = { ...placedZones, [zoneId]: currentRound.imageKey };
      setPlacedZones(newPlaced);

      if (roundIdx + 1 >= KW_TOTAL_ROUNDS) {
        setGamePhase("won");
        setBestiaryUnlocked(true);
        if (!alreadyWon) awardScroll(KNOWN_WORLD_SCROLL_ID);
      } else {
        setTimeout(() => {
          setRoundIdx((r) => r + 1);
        }, 700);
      }
    } else {
      // Wrong placement
      const newLives = lives - 1;
      const newWrong = wrongCount + 1;
      setLives(newLives);
      setWrongCount(newWrong);
      setGamePhase("wrong-flash");

      setTimeout(() => {
        if (newLives <= 0) {
          setGamePhase("lost");
        } else {
          setGamePhase("playing");
        }
      }, 1400);
    }
  };

  const isWrong = gamePhase === "wrong-flash";

  return (
    <div className="bg-[#0a0804] pb-20">
      {/* Inject CSS */}
      <style>{KW_STYLES}</style>

      {/* ── Steampunk divider ── */}
      <div className="max-w-3xl mx-auto px-4 pt-12 mb-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="flex items-center gap-2 px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary/60">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" />
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83"
              stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ── Title ── */}
      <div className="max-w-3xl mx-auto px-4 text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl tracking-[0.12em]"
          style={{ color: "hsl(38 72% 55%)" }}
        >
          The Known World
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-3 font-narrative italic text-muted-foreground text-[0.9375rem] leading-[1.8]"
        >
          Every citizen of Panterra knows their place. Do you know theirs? Place them correctly — or discover what happens to those who end up where they do not belong.
        </motion.p>
      </div>

      {/* ── Game container ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto px-4"
      >
        <div
          className="border border-border bg-card relative overflow-hidden"
          style={{ minHeight: 340 }}
        >

          {/* ── White flash on wrong (disorienting at 3 wrongs) ── */}
          <AnimatePresence>
            {isWrong && (
              <motion.div
                key="flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: wrongCount >= 3 ? 0.9 : 0.45 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 z-40 pointer-events-none"
                style={{ background: wrongCount >= 3 ? "white" : "rgba(255,255,255,0.4)" }}
              />
            )}
          </AnimatePresence>

          {/* ── Lost screen ── */}
          <AnimatePresence>
            {gamePhase === "lost" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-background/96 flex flex-col items-center justify-center z-50 gap-6 p-8 text-center"
              >
                <p className="font-display text-xs tracking-[0.25em] text-destructive uppercase">
                  Displaced
                </p>
                <p className="font-narrative italic text-foreground/70 text-[0.9375rem] leading-[1.8] max-w-sm">
                  You placed them where they do not belong. In Panterra, that is not a mistake you get to make twice.
                </p>
                <button
                  onClick={fullReset}
                  className="px-8 py-2.5 border font-body text-[10px] tracking-widest uppercase hover:bg-primary/10 transition-colors"
                  style={{ borderColor: "hsl(38 72% 50%)", color: "hsl(38 72% 55%)" }}
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Won screen ── */}
          <AnimatePresence>
            {gamePhase === "won" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-background/93 flex flex-col items-center justify-center z-50 gap-5 p-8 text-center"
              >
                <p className="font-display text-xs tracking-[0.25em] text-primary uppercase">
                  The World Revealed
                </p>
                <p className="font-narrative italic text-foreground/70 text-[0.9375rem] leading-[1.8] max-w-sm">
                  You know this world better than most of its citizens do. That makes you either very safe or very dangerous. A scroll fragment has been added to your collection.
                </p>
                {!alreadyWon && (
                  <Link
                    to="/bestiary"
                    className="font-body text-[10px] tracking-[0.25em] uppercase transition-colors"
                    style={{ color: "hsl(38 72% 50%)" }}
                  >
                    A new entry has been added to the Bestiary.
                  </Link>
                )}
                <div className="w-8 h-px bg-primary/40" />
                <button
                  onClick={fullReset}
                  className="px-8 py-2.5 border border-border text-muted-foreground font-body text-[10px] tracking-widest uppercase hover:border-primary/40 hover:text-primary transition-colors"
                >
                  Play Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Playing / wrong ── */}
          {(gamePhase === "playing" || gamePhase === "wrong-flash") && currentRound && (
            <div className="p-5 sm:p-6 flex flex-col gap-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="text-[9px] tracking-[0.3em] text-muted-foreground/50 uppercase font-body">
                  Round {roundIdx + 1} of {KW_TOTAL_ROUNDS}
                </p>
                {/* Lives */}
                <div className="flex gap-2 items-center">
                  <p className="text-[8px] tracking-[0.2em] text-muted-foreground/40 uppercase font-body mr-1">Lives</p>
                  {Array.from({ length: KW_TOTAL_LIVES }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border transition-all duration-500"
                      style={{
                        background:  i < lives ? "hsl(38 72% 50%)" : "transparent",
                        borderColor: i < lives ? "hsl(38 72% 50%)" : "hsl(38 20% 25%)",
                        boxShadow:   i < lives ? "0 0 6px hsl(38 72% 50% / 0.6)" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Portrait + map layout */}
              <div className="flex flex-col sm:flex-row gap-5 items-stretch">

                {/* Left: character portrait card */}
                <div className="flex flex-col items-center gap-3 sm:w-40 flex-shrink-0">
                  <div
                    className="w-28 sm:w-36 aspect-[2/3] overflow-hidden border"
                    style={{ borderColor: "hsl(38 40% 30%)" }}
                  >
                    <img
                      src={characterImageMap[currentRound.imageKey]}
                      alt={currentRound.charName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-display text-[11px] tracking-[0.15em] text-foreground leading-snug">
                      {currentRound.charName}
                    </p>
                    <p className="font-body text-[9px] tracking-wider text-muted-foreground/50 mt-0.5 uppercase">
                      Place in their region
                    </p>
                  </div>
                </div>

                {/* Right: map zones + The Lost */}
                <div className="flex-1 relative flex flex-col gap-2">
                  {/* Map atmosphere header */}
                  <p className="text-[8px] tracking-[0.3em] text-muted-foreground/30 uppercase font-body">
                    ◈ Panterra — Select Region
                  </p>

                  {/* Zone grid — 2×2 */}
                  <div className="relative grid grid-cols-2 gap-2 flex-1" style={{ minHeight: 180 }}>
                    {KW_ZONES.map((zone) => (
                      <ZoneButton
                        key={zone.id}
                        zone={zone}
                        onClick={() => handlePlace(zone.id)}
                        disabled={gamePhase === "wrong-flash" || !!placedZones[zone.id]}
                        placedChar={placedZones[zone.id]}
                      />
                    ))}

                    {/* The Lost overlay — appears inside zone grid */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <LostFigure wrongCount={wrongCount} />
                    </div>
                  </div>

                  {/* Wrong feedback */}
                  <AnimatePresence>
                    {isWrong && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center font-narrative italic text-[0.875rem] leading-[1.7]"
                        style={{ color: "hsl(0 60% 55%)" }}
                      >
                        That is not where they belong.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          )}
        </div>
      </motion.div>

      {/* ── Bestiary Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="max-w-3xl mx-auto mt-10 px-4"
      >
        <div className="border border-border bg-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            {/* Ghost icon */}
            <div className="flex-shrink-0 w-12 h-14 border border-border flex items-end justify-center pb-1 overflow-hidden">
              {bestiaryUnlocked || alreadyWon ? (
                <svg width="22" height="40" viewBox="0 0 22 40" fill="none">
                  <ellipse cx="11" cy="8" rx="7" ry="7" fill="hsl(38 20% 22%)" />
                  <path d="M4 16 Q3 32 2 40 L7 40 L8 28 L11 30 L14 28 L15 40 L20 40 Q19 32 18 16 Z" fill="hsl(38 20% 14%)" />
                  {/* drift lines */}
                  <path d="M5 20 Q3 26 4 30" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
                  <path d="M17 22 Q19 28 18 32" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-border mb-1">
                  <rect x="3" y="7" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[9px] tracking-[0.3em] text-primary uppercase font-body mb-1">
                Bestiary · Displaced Entity
              </p>
              <h3 className="font-display text-base tracking-wide text-foreground">
                The Lost
              </h3>
              <div className="mt-3 relative">
                <p
                  className="font-narrative text-[0.875rem] text-foreground/70 leading-[1.8] transition-all duration-700"
                  style={{
                    filter:     bestiaryUnlocked || alreadyWon ? "none" : "blur(4px)",
                    userSelect: bestiaryUnlocked || alreadyWon ? "text" : "none",
                  }}
                >
                  The bio-warfare wasteland beyond Panterra's borders has been uninhabitable since the Great War. Expedition records from years 3, 7, and 12 of the New Republic describe figures moving in the dead zones. The expeditions were classified. The figures were not mentioned in the public summary.
                </p>
                {!(bestiaryUnlocked || alreadyWon) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase font-body">
                      Place all five correctly to unlock
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

