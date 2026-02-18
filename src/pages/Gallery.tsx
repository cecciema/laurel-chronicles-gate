import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SectionHeader from "@/components/SectionHeader";
import { characters } from "@/data/world-data";
import { characterImageMap } from "@/data/guide-images";

type FilterType = "All" | "Uniform" | "Traditional";

const galleryItems = characters.flatMap((char) => [
  {
    src: characterImageMap[char.image],
    title: char.name,
    subtitle: char.title,
    category: "Uniform" as FilterType,
    magistry: char.magistry ?? char.faction,
  },
  {
    src: characterImageMap[`${char.image}-traditional`],
    title: char.name,
    subtitle: "Ancient Traditional Attire",
    category: "Traditional" as FilterType,
    magistry: char.magistry ?? char.faction,
  },
]);

const Gallery = () => {
  const [filter, setFilter] = useState<FilterType>("All");

  const filtered = filter === "All" ? galleryItems : galleryItems.filter((g) => g.category === filter);

  return (
    <Layout>
      <div className="pt-24 pb-20 px-4">
        <SectionHeader
          title="Visual Gallery"
          subtitle="Cinematic portraits from the world of Laurel Crowns Above"
        />

        {/* Filter Controls */}
        <div className="flex justify-center gap-3 mb-10">
          {(["All", "Uniform", "Traditional"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 font-display text-xs tracking-[0.25em] uppercase transition-all ${
                filter === f
                  ? "border border-primary text-primary shadow-glow"
                  : "border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
          >
            {filtered.map((item, i) => (
              <motion.div
                key={`${item.title}-${item.category}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="break-inside-avoid group relative overflow-hidden border border-border"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[9px] tracking-[0.3em] text-primary uppercase font-body">
                    {item.magistry} · {item.category}
                  </span>
                  <p className="font-display text-sm tracking-wide text-foreground mt-1">
                    {item.title}
                  </p>
                  <p className="font-narrative text-[11px] text-foreground/60 italic mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Gallery;
