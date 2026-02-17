import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionHeader from "@/components/SectionHeader";
import { worldRegions } from "@/data/world-data";
import worldMap from "@/assets/world-map.jpg";

const WorldMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const region = worldRegions.find((r) => r.id === selectedRegion);

  return (
    <Layout>
      <div className="pt-24 pb-20 px-4">
        <SectionHeader
          title="World Map"
          subtitle="Select a region to uncover its lore and secrets"
        />

        <div className="max-w-5xl mx-auto">
          {/* Map Image */}
          <div className="relative mb-8">
            <img
              src={worldMap}
              alt="World Map"
              className="w-full max-w-2xl mx-auto border border-border shadow-deep"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
          </div>

          {/* Region Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {worldRegions.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`px-4 py-2 text-xs tracking-[0.15em] uppercase font-body border transition-all ${
                  selectedRegion === r.id
                    ? "border-primary text-primary shadow-brass"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {/* Region Detail */}
          {region && (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto bg-card border border-border p-6"
            >
              <span className="text-[10px] tracking-[0.3em] text-primary uppercase font-body">
                {region.faction}
              </span>
              <h3 className="font-display text-2xl tracking-wide text-foreground mt-1">
                {region.name}
              </h3>
              <p className="mt-4 text-sm text-foreground/70 font-body leading-relaxed">
                {region.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {region.features.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] tracking-wider text-foreground/60 bg-secondary px-2 py-1 font-body"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WorldMap;
