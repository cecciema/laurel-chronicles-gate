import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { HiddenOrb } from "@/components/ChroniclesSystem";
import { useIsMobile } from "@/hooks/use-mobile";
import { worldRegions } from "@/data/world-data";
import { X } from "lucide-react";
import panterraMap from "@/assets/panterra-map.jpg";

// ── Hotspot definitions (percentage-based) ────────────────────────────────────
const HOTSPOTS = [
  { id: "panterra",       top: "15%", left: "10%", width: "20%", height: "25%", labelX: "20%", labelY: "13%" },
  { id: "sanctorium",    top: "10%", left: "35%", width: "20%", height: "25%", labelX: "45%", labelY: "8%"  },
  { id: "deepforge",     top: "12%", left: "62%", width: "20%", height: "25%", labelX: "72%", labelY: "10%" },
  { id: "ocean-reaches", top: "55%", left: "15%", width: "20%", height: "25%", labelX: "25%", labelY: "53%" },
  { id: "ashfields",     top: "58%", left: "45%", width: "20%", height: "25%", labelX: "55%", labelY: "56%" },
  { id: "deepforge-south", top: "52%", left: "70%", width: "20%", height: "25%", labelX: "80%", labelY: "50%" },
];

// ── Main Component ─────────────────────────────────────────────────────────────
const WorldMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const region = worldRegions.find((r) => r.id === selectedRegion)
    ?? (selectedRegion === "deepforge-south" ? {
        id: "deepforge-south",
        name: "Southern Reaches",
        faction: "Contested Territory",
        description: "The untamed southern borderlands where no single faction holds dominion. Shifting allegiances and ancient ruins mark this contested expanse.",
        features: ["Contested", "Ancient Ruins", "Shifting Borders"],
      } : null);

  const handleHotspotClick = (id: string) => {
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
            className="absolute inset-0 pointer-events-none z-10 rounded"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)"
            }}
          />

          {/* Image + hotspot layer */}
          <div className="relative">
            <div className="relative w-full select-none">
              {/* Map image */}
              <img
                src={panterraMap}
                alt="Map of Panterra — Known Territories"
                className="w-full h-auto block rounded"
                draggable={false}
              />

              {/* Hotspots */}
              {HOTSPOTS.map((spot) => {
                const isSelected = selectedRegion === spot.id;
                const isHovered  = hoveredRegion  === spot.id;
                const regionData = worldRegions.find(r => r.id === spot.id)
                  ?? (spot.id === "deepforge-south" ? { name: "Southern Reaches" } : null);

                return (
                  <div key={spot.id}>
                    {/* Clickable hotspot */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={regionData?.name ?? spot.id}
                      onClick={() => handleHotspotClick(spot.id)}
                      onKeyDown={(e) => e.key === "Enter" && handleHotspotClick(spot.id)}
                      onMouseEnter={() => setHoveredRegion(spot.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      className={[
                        "absolute cursor-pointer rounded-sm transition-all duration-200",
                        "border",
                        isSelected
                          ? "border-primary/80 bg-primary/15 shadow-[0_0_12px_2px_hsl(var(--primary)/0.25)]"
                          : isHovered
                          ? "border-primary/60 bg-primary/10"
                          : "border-transparent bg-transparent",
                      ].join(" ")}
                      style={{
                        top:    spot.top,
                        left:   spot.left,
                        width:  spot.width,
                        height: spot.height,
                      }}
                    />

                    {/* Floating label — visible on hover or selected */}
                    <AnimatePresence>
                      {(isHovered || isSelected) && (
                        <motion.div
                          key={spot.id + "-label"}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-full"
                          style={{ left: spot.labelX, top: spot.labelY }}
                        >
                          <span className="block bg-[#0f0b06]/90 border border-primary/40 text-primary font-display text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm whitespace-nowrap shadow-lg">
                            {regionData?.name ?? spot.id}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* HiddenOrb — bottom-left corner */}
              <div className="absolute bottom-2 left-2 z-20">
                <HiddenOrb id={7} className="w-3 h-3" />
              </div>
            </div>

            {/* ── Desktop side panel ── */}
            <AnimatePresence>
              {region && !isMobile && (
                <motion.div
                  key={region.id + "-desktop"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-0 right-0 w-64 h-full bg-[#0f0b06]/95 border-l border-amber-900/30 p-5 overflow-y-auto z-30 rounded-r"
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
                    {region.features?.map((f) => (
                      <span key={f} className="text-[9px] tracking-wider text-foreground/50 bg-secondary px-2 py-1 font-body">
                        {f}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Legend */}
          <p className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase font-body text-center mt-4">
            Regions: {worldRegions.length} · Controlled Territories · Contested Zones
          </p>
        </div>

        {/* ── Mobile slide-up panel ── */}
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
                {region.features?.map((f) => (
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
