import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { HiddenOrb } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import { worldRegions } from "@/data/world-data";
import { X } from "lucide-react";

// ── Region shape definitions ──────────────────────────────────────────────────
const REGION_SHAPES = [
  {
    id: "panterra",
    points: "80,60 280,50 310,100 290,220 230,250 120,240 70,190 60,110",
    labelX: 185,
    labelY: 148,
    fill: "#1a2e1a",
    hoverGlow: "#4ade80",
    city: { x: 185, y: 140, name: "Panterra Central" },
  },
  {
    id: "sanctorium",
    points: "320,40 520,35 540,90 520,210 430,240 320,230 300,130 310,80",
    labelX: 420,
    labelY: 135,
    fill: "#1e2a3a",
    hoverGlow: "#60a5fa",
    city: { x: 420, y: 125, name: "Pantheon Ivory" },
  },
  {
    id: "deepforge",
    points: "550,50 730,45 760,100 750,230 660,260 540,250 520,150 530,80",
    labelX: 640,
    labelY: 145,
    fill: "#2e1a0e",
    hoverGlow: "#fb923c",
    city: { x: 638, y: 138, name: "The Deep Forge Core" },
  },
  {
    id: "ocean-reaches",
    points: "60,270 230,260 280,300 260,430 200,470 80,460 40,390 45,300",
    labelX: 162,
    labelY: 370,
    fill: "#1a3a3a",
    hoverGlow: "#2dd4bf",
    city: { x: 160, y: 362, name: "Culver's Field Station" },
  },
  {
    id: "ashfields",
    points: "310,260 560,255 580,310 560,450 460,490 310,480 280,400 290,290",
    labelX: 430,
    labelY: 375,
    fill: "#2e0e1a",
    hoverGlow: "#f472b6",
    city: { x: 428, y: 365, name: "Frontier Outpost" },
  },
];

// Extra decorative region — ungoverned ocean to the right
const OCEAN_SHAPE = {
  points: "770,260 940,255 960,310 950,470 870,500 760,485 740,390 745,295",
  fill: "#0e1a2e",
  labelX: 848,
  labelY: 380,
  label: "OUTER",
};

// ── Compass Rose ──────────────────────────────────────────────────────────────
const CompassRose = () => (
  <g transform="translate(905, 500)" opacity="0.5">
    <line x1="0" y1="-38" x2="0" y2="38" stroke="#d4a832" strokeWidth="1" />
    <line x1="-38" y1="0" x2="38" y2="0" stroke="#d4a832" strokeWidth="1" />
    <line x1="-27" y1="-27" x2="27" y2="27" stroke="#d4a832" strokeWidth="0.5" />
    <line x1="27" y1="-27" x2="-27" y2="27" stroke="#d4a832" strokeWidth="0.5" />
    <polygon points="0,-38 -5,-20 0,-26 5,-20" fill="#d4a832" />
    <circle r="5" fill="none" stroke="#d4a832" strokeWidth="1" />
    <circle r="2" fill="#d4a832" />
    <text x="0" y="-44" textAnchor="middle" fill="#d4a832" fontSize="8" fontFamily="Cinzel, serif">N</text>
    <text x="0" y="54" textAnchor="middle" fill="#d4a832" fontSize="8" fontFamily="Cinzel, serif">S</text>
    <text x="46" y="4" textAnchor="middle" fill="#d4a832" fontSize="8" fontFamily="Cinzel, serif">E</text>
    <text x="-46" y="4" textAnchor="middle" fill="#d4a832" fontSize="8" fontFamily="Cinzel, serif">W</text>
  </g>
);

// ── Pulse City Dot ─────────────────────────────────────────────────────────────
const CityPulse = ({ x, y, name }: { x: number; y: number; name: string }) => (
  <g>
    <title>{name}</title>
    <circle cx={x} cy={y} r="4" fill="rgba(212,168,50,0.2)">
      <animate attributeName="r" from="4" to="14" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx={x} cy={y} r="3.5" fill="#d4a832" />
    <circle cx={x} cy={y} r="1.5" fill="#fff8e0" />
  </g>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const WorldMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const isMobile = windowWidth < 640;
  const region = worldRegions.find((r) => r.id === selectedRegion);

  const handleRegionClick = (id: string) => {
    setSelectedRegion(prev => prev === id ? null : id);
  };

  return (
    <Layout>
      <div className="pt-20 pb-24 overflow-x-hidden bg-[#0f0b06] min-h-screen">
        {/* Title */}
        <div className="text-center pt-4 pb-2 px-4">
          <p className="font-display text-xs tracking-[0.5em] text-primary/60 uppercase">
            Panterra — Known Territories
          </p>
          <div className="steampunk-divider max-w-xs mx-auto mt-3" />
        </div>

        {/* Map container */}
        <div className="relative max-w-5xl mx-auto px-3 sm:px-6 mt-4">
          {/* Fog vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)"
            }}
          />

          {/* SVG Map */}
          <div className="relative">
            <svg
              viewBox="0 0 1000 560"
              className="w-full h-auto"
              style={{ display: "block" }}
            >
              {/* ── Defs: texture pattern ── */}
              <defs>
                <pattern id="mapTexture" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="40" x2="40" y2="0" stroke="rgba(180,140,60,0.04)" strokeWidth="1" />
                </pattern>
                <filter id="glow-teal">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* ── Background ── */}
              <rect width="1000" height="560" fill="#1a1208" />
              <rect width="1000" height="560" fill="url(#mapTexture)" />

              {/* ── Grid lines ── */}
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(x => (
                <line key={`vg${x}`} x1={x} y1="0" x2={x} y2="560" stroke="rgba(212,168,50,0.05)" strokeWidth="0.5" />
              ))}
              {[100, 200, 300, 400, 500].map(y => (
                <line key={`hg${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(212,168,50,0.05)" strokeWidth="0.5" />
              ))}

              {/* ── Brass border frame ── */}
              <rect x="8" y="8" width="984" height="544" fill="none" stroke="rgba(212,168,50,0.2)" strokeWidth="2" />

              {/* ── Corner ornaments ── */}
              {[[18, 18], [982, 18], [18, 542], [982, 542]].map(([cx, cy], i) => (
                <text key={i} x={cx} y={cy + 5} textAnchor="middle" fill="rgba(212,168,50,0.3)" fontSize="14" fontFamily="Cinzel, serif">✦</text>
              ))}

              {/* ── Decorative ocean fill ── */}
              <polygon
                points={OCEAN_SHAPE.points}
                fill={OCEAN_SHAPE.fill}
                stroke="rgba(212,168,50,0.1)"
                strokeWidth="1"
              />
              <text x={OCEAN_SHAPE.labelX} y={OCEAN_SHAPE.labelY} textAnchor="middle" fill="rgba(220,190,120,0.4)" fontSize="11" fontFamily="Cinzel, serif" letterSpacing="3">
                {OCEAN_SHAPE.label}
              </text>
              <text x={OCEAN_SHAPE.labelX} y={OCEAN_SHAPE.labelY + 16} textAnchor="middle" fill="rgba(220,190,120,0.3)" fontSize="9" fontFamily="Cinzel, serif" letterSpacing="2">
                REACHES
              </text>

              {/* ── Clickable Region polygons ── */}
              {REGION_SHAPES.map((shape) => {
                const isSelected = selectedRegion === shape.id;
                const isHovered = hoveredRegion === shape.id;
                const regionData = worldRegions.find(r => r.id === shape.id);
                return (
                  <g key={shape.id}>
                    <title>{regionData?.name ?? shape.id}</title>
                    <polygon
                      points={shape.points}
                      fill={shape.fill}
                      fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.75}
                      stroke={isSelected ? "#d4a832" : isHovered ? shape.hoverGlow : "rgba(212,168,50,0.15)"}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 1}
                      className="cursor-pointer transition-all duration-200"
                      style={isHovered ? { filter: `drop-shadow(0 0 8px ${shape.hoverGlow})` } : undefined}
                      onClick={() => handleRegionClick(shape.id)}
                      onMouseEnter={() => setHoveredRegion(shape.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    />
                    <text
                      x={shape.labelX}
                      y={shape.labelY + 18}
                      textAnchor="middle"
                      fill="rgba(220,190,120,0.8)"
                      fontSize="11"
                      fontFamily="Cinzel, serif"
                      letterSpacing="2"
                      className="pointer-events-none select-none"
                    >
                      {regionData?.name.split(" ")[0].toUpperCase()}
                    </text>
                    <text
                      x={shape.labelX}
                      y={shape.labelY + 31}
                      textAnchor="middle"
                      fill="rgba(180,140,60,0.4)"
                      fontSize="7"
                      fontFamily="Cinzel, serif"
                      letterSpacing="1.5"
                      className="pointer-events-none select-none"
                    >
                      {regionData?.faction.split(" ").slice(0, 2).join(" ").toUpperCase()}
                    </text>
                    {isSelected && (
                      <circle cx={shape.labelX} cy={shape.labelY} r="5" fill="#d4a832" opacity="0.7" />
                    )}
                  </g>
                );
              })}

              {/* ── City pulse dots ── */}
              {REGION_SHAPES.filter(s => s.city).map(s => (
                <CityPulse key={s.id} x={s.city.x} y={s.city.y} name={s.city.name} />
              ))}

              {/* ── Compass rose ── */}
              <CompassRose />

              {/* ── Decorative coastline dashes ── */}
              <path d="M 60,260 Q 30,320 40,400 Q 50,460 80,480" fill="none" stroke="rgba(212,168,50,0.1)" strokeWidth="1" strokeDasharray="4,6" />
              <path d="M 560,255 Q 650,248 760,258" fill="none" stroke="rgba(212,168,50,0.1)" strokeWidth="1" strokeDasharray="4,6" />

              {/* ── Hidden Orb 7 ── */}
              <foreignObject x="32" y="492" width="24" height="24">
                <HiddenOrb id={7} className="w-3 h-3" />
              </foreignObject>
            </svg>

            {/* ── Desktop side panel (JS breakpoint, not CSS) ── */}
            <AnimatePresence>
              {region && !isMobile && (
                <motion.div
                  key={region.id + "-desktop"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-0 right-0 w-64 h-full bg-[#0f0b06]/95 border-l border-amber-900/30 p-5 overflow-y-auto z-20"
                >
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-[9px] tracking-[0.3em] text-primary uppercase font-body mb-1 pr-6">
                    {region.faction}
                  </p>
                  <h3 className="font-display text-base tracking-wide text-foreground leading-tight mb-3">
                    {region.name}
                  </h3>
                  <div className="h-px bg-amber-900/30 mb-3" />
                  <p className="font-narrative italic text-[0.875rem] text-foreground/70 leading-[1.8] mb-4">
                    {region.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {region.features.map((f) => (
                      <span key={f} className="text-[9px] tracking-wider text-foreground/50 bg-secondary px-2 py-1 font-body">
                        {f}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Legend ── */}
          <p className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase font-body text-center mt-4">
            Regions: {worldRegions.length} · Controlled Territories · Contested Zones
          </p>
        </div>

        {/* ── Mobile detail panel — JS-gated, slides up from bottom ── */}
        <AnimatePresence>
          {region && isMobile && (
            <motion.div
              key={region.id + "-mobile"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-[60px] left-0 right-0 z-50 bg-[#0f0b06] border-t border-amber-900/30 p-5 max-h-[45vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[9px] tracking-[0.3em] text-primary uppercase font-body">{region.faction}</p>
                  <h3 className="font-display text-lg tracking-wide text-foreground mt-0.5">{region.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors mt-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="h-px bg-amber-900/30 mb-3" />
              <p className="font-narrative italic text-[0.9375rem] text-foreground/70 leading-[1.8] mb-4">
                {region.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {region.features.map((f) => (
                  <span key={f} className="text-[10px] tracking-wider text-foreground/50 bg-secondary px-2 py-1 font-body">
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default WorldMap;
