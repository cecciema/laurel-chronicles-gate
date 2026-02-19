import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const { questCompleted, foundScrolls } = useGame();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion,  setHoveredRegion]  = useState<string | null>(null);
  const isMobile = useIsMobile();

  const arborwellUnlocked = foundScrolls.length >= 3 || foundScrolls.includes(8);
  const valoricaUnlocked  = questCompleted && arborwellUnlocked;

  const selectedData = SUB_REGIONS.find((r) => r.id === selectedRegion) ?? null;

  // ── Transform state ──────────────────────────────────────────────────────────
  const [scale, setScale]   = useState(1);
  const [tx, setTx]         = useState(0); // translateX in px
  const [ty, setTy]         = useState(0); // translateY in px
  // Whether a programmatic (animated) zoom is active
  const [animated, setAnimated] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const containerRef  = useRef<HTMLDivElement>(null);
  const isDragging    = useRef(false);
  const dragStart     = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const hasDragged    = useRef(false);       // distinguish click vs drag
  const lastPinchDist = useRef<number | null>(null);
  const lastPinchMid  = useRef<{ x: number; y: number } | null>(null);
  const animFrameRef  = useRef<number | null>(null);

  // ── Constrain translation so map never shows black gaps ─────────────────────
  const constrain = useCallback(
    (nextTx: number, nextTy: number, nextScale: number) => {
      const el = containerRef.current;
      if (!el) return { tx: nextTx, ty: nextTy };
      const { width: cw, height: ch } = el.getBoundingClientRect();
      const mapW = cw * nextScale;
      const mapH = ch * nextScale;
      const maxX = (mapW - cw) / 2;
      const maxY = (mapH - ch) / 2;
      return {
        tx: clamp(nextTx, -maxX, maxX),
        ty: clamp(nextTy, -maxY, maxY),
      };
    },
    []
  );

  // ── Apply constrained scale + translation ────────────────────────────────────
  const applyTransform = useCallback(
    (nextScale: number, nextTx: number, nextTy: number, useAnimation = false) => {
      const s = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const { tx: cx, ty: cy } = constrain(nextTx, nextTy, s);
      setAnimated(useAnimation);
      setScale(s);
      setTx(cx);
      setTy(cy);
    },
    [constrain]
  );

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetTransform = useCallback(() => {
    applyTransform(1, 0, 0, true);
    setSelectedRegion(null);
  }, [applyTransform]);

  // ── Zoom toward a point (container-relative px) ──────────────────────────────
  const zoomToward = useCallback(
    (
      delta: number,
      originX: number,
      originY: number,
      currentScale: number,
      currentTx: number,
      currentTy: number
    ) => {
      const el = containerRef.current;
      if (!el) return { scale: currentScale, tx: currentTx, ty: currentTy };
      const { width: cw, height: ch } = el.getBoundingClientRect();

      const nextScale = clamp(currentScale + delta, MIN_SCALE, MAX_SCALE);
      if (nextScale === currentScale) return { scale: currentScale, tx: currentTx, ty: currentTy };

      // Point on the image (in image-space) that should stay fixed
      const imgX = (originX - cw / 2 - currentTx) / currentScale;
      const imgY = (originY - ch / 2 - currentTy) / currentScale;

      const nextTx = originX - cw / 2 - imgX * nextScale;
      const nextTy = originY - ch / 2 - imgY * nextScale;
      const { tx: cx, ty: cy } = constrain(nextTx, nextTy, nextScale);

      return { scale: nextScale, tx: cx, ty: cy };
    },
    [constrain]
  );

  // ── Programmatic region zoom (auto-zoom on hotspot click) ────────────────────
  const zoomToRegion = useCallback(
    (regionId: string) => {
      const el = containerRef.current;
      if (!el) return;
      const { width: cw, height: ch } = el.getBoundingClientRect();
      const focus = REGION_FOCUS[regionId];
      if (!focus) return;

      const targetScale = isMobile ? 2 : 2.4;
      const imgX = (focus.x - 0.5) * cw;
      const imgY = (focus.y - 0.5) * ch;
      const nextTx = -imgX * targetScale;
      const nextTy = -imgY * targetScale;
      const { tx: cx, ty: cy } = constrain(nextTx, nextTy, targetScale);

      setAnimated(true);
      setScale(targetScale);
      setTx(cx);
      setTy(cy);
    },
    [isMobile, constrain]
  );

  // ── Toggle region + auto-zoom ────────────────────────────────────────────────
  const toggleRegion = useCallback(
    (id: string) => {
      setSelectedRegion((prev) => {
        if (prev === id) {
          // deselect → reset
          applyTransform(1, 0, 0, true);
          return null;
        }
        return id;
      });
    },
    [applyTransform]
  );

  // Trigger region zoom whenever selectedRegion changes
  useEffect(() => {
    if (selectedRegion) {
      zoomToRegion(selectedRegion);
    }
  }, [selectedRegion, zoomToRegion]);

  const closeRegion = useCallback(() => {
    setSelectedRegion(null);
    applyTransform(1, 0, 0, true);
  }, [applyTransform]);

  // ── Mouse drag (desktop) ─────────────────────────────────────────────────────
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      isDragging.current  = true;
      hasDragged.current  = false;
      dragStart.current   = { x: e.clientX, y: e.clientY, tx, ty };
      setAnimated(false);
      e.preventDefault();
    },
    [tx, ty]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
      const next = constrain(dragStart.current.tx + dx, dragStart.current.ty + dy, scale);
      setTx(next.tx);
      setTy(next.ty);
    };
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, [scale, constrain]);

  // ── Scroll wheel zoom (desktop) ──────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const originX = e.clientX - rect.left;
      const originY = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setAnimated(false);
      setScale((prevScale) => {
        setTx((prevTx) => {
          setTy((prevTy) => {
            const result = zoomToward(delta, originX, originY, prevScale, prevTx, prevTy);
            // We'll apply scale+translation atomically via a single RAF
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = requestAnimationFrame(() => {
              setScale(result.scale);
              setTx(result.tx);
              setTy(result.ty);
            });
            return prevTy;
          });
          return prevTx;
        });
        return prevScale;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomToward]);

  // ── Touch drag + pinch (mobile) ──────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      setAnimated(false);
      if (e.touches.length === 1) {
        isDragging.current = true;
        hasDragged.current = false;
        const t = e.touches[0];
        dragStart.current = { x: t.clientX, y: t.clientY, tx, ty };
        lastPinchDist.current = null;
        lastPinchMid.current  = null;
      } else if (e.touches.length === 2) {
        isDragging.current = false;
        const [a, b] = [e.touches[0], e.touches[1]];
        lastPinchDist.current = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        lastPinchMid.current  = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
      }
    };

    // Keep a live reference to current tx/ty for touch handlers
    let liveTx = tx;
    let liveTy = ty;
    let liveScale = scale;

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1 && isDragging.current) {
        const t = e.touches[0];
        const dx = t.clientX - dragStart.current.x;
        const dy = t.clientY - dragStart.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
        const next = constrain(dragStart.current.tx + dx, dragStart.current.ty + dy, liveScale);
        liveTx = next.tx;
        liveTy = next.ty;
        setTx(liveTx);
        setTy(liveTy);
      } else if (e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        const mid  = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };

        if (lastPinchDist.current && lastPinchMid.current) {
          const ratio = dist / lastPinchDist.current;
          const nextScale = clamp(liveScale * ratio, MIN_SCALE, MAX_SCALE);
          const rect = el.getBoundingClientRect();
          const originX = mid.x - rect.left;
          const originY = mid.y - rect.top;
          const result = zoomToward(nextScale - liveScale, originX, originY, liveScale, liveTx, liveTy);
          liveScale = result.scale;
          liveTx    = result.tx;
          liveTy    = result.ty;
          setScale(liveScale);
          setTx(liveTx);
          setTy(liveTy);
        }

        lastPinchDist.current = dist;
        lastPinchMid.current  = mid;
      }
    };

    const onTouchEnd = () => {
      isDragging.current    = false;
      lastPinchDist.current = null;
      lastPinchMid.current  = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constrain, zoomToward]);

  // ── Zoom button handlers ─────────────────────────────────────────────────────
  const zoomIn = () => {
    const el = containerRef.current;
    if (!el) return;
    const { width: cw, height: ch } = el.getBoundingClientRect();
    const result = zoomToward(ZOOM_STEP, cw / 2, ch / 2, scale, tx, ty);
    applyTransform(result.scale, result.tx, result.ty, true);
  };

  const zoomOut = () => {
    const el = containerRef.current;
    if (!el) return;
    const { width: cw, height: ch } = el.getBoundingClientRect();
    const result = zoomToward(-ZOOM_STEP, cw / 2, ch / 2, scale, tx, ty);
    applyTransform(result.scale, result.tx, result.ty, true);
  };

  // ── Cursor style ─────────────────────────────────────────────────────────────
  const [cursorGrabbing, setCursorGrabbing] = useState(false);

  useEffect(() => {
    const setGrabbing = () => setCursorGrabbing(true);
    const setGrab     = () => setCursorGrabbing(false);
    window.addEventListener("mousedown", setGrabbing);
    window.addEventListener("mouseup",   setGrab);
    return () => {
      window.removeEventListener("mousedown", setGrabbing);
      window.removeEventListener("mouseup",   setGrab);
    };
  }, []);

  // CSS transform string
  const transformStyle: React.CSSProperties = {
    transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
    transformOrigin: "center center",
    transition: animated ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
    willChange: "transform",
  };

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
              Scrolls: {foundScrolls.length}/8
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
              style={{
                minHeight: isMobile ? 400 : 600,
                cursor: cursorGrabbing && isDragging.current ? "grabbing" : "grab",
              }}
              onMouseDown={onMouseDown}
            >
              {/* ── Zoomable inner wrapper (drag + pan transform) ── */}
              <div style={{ ...transformStyle, width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>

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

                {/* === ARBORWELL === */}
                <div className="absolute z-20" style={ARBORWELL_STYLE}>
                  <div className="relative w-full h-full cursor-not-allowed">
                    <div
                      className="absolute inset-0 rounded-sm border border-dashed"
                      style={{ borderColor: "#6b728060", background: "#6b728010" }}
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

              {/* HiddenOrb — outside transform so it stays stable */}
              <div className="absolute bottom-2 left-2 z-30">
                <HiddenOrb id={7} className="w-3 h-3" />
              </div>

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
    </Layout>
  );
};

export default WorldMap;
