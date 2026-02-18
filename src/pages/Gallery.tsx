import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { HiddenOrb, HiddenSigil } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import { characters } from "@/data/world-data";
import { characterImageMap } from "@/data/guide-images";

import heroCityscape from "@/assets/hero-cityscape.jpg";
import worldMap from "@/assets/world-map.jpg";
import gearsTexture from "@/assets/gears-texture.jpg";

const Gallery = () => {
  // Combine static environmental shots with character portraits
  const galleryItems = [
    { src: heroCityscape, title: "The Brass Citadel Skyline", category: "Environment", subtitle: "Capital of the Republic" },
    ...characters.map(char => ({
      src: characterImageMap[char.image],
      title: char.name,
      category: "Character",
      subtitle: char.title,
      magistry: char.magistry ?? char.faction
    })),
    { src: gearsTexture, title: "Imperial Machinery", category: "Detail", subtitle: "The engine of the world" },
    { src: worldMap, title: "Empire Territorial Map", category: "Cartography", subtitle: "Known world borders" },
  ];

  return (
    <Layout>
      <div className="pt-24 pb-20 px-4 overflow-x-hidden">
        <SectionHeader
          title="Visual Gallery"
          subtitle="Cinematic visions from the world of Laurel Crowns Above"
        />

        <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 w-full">
          {galleryItems.map((item, i) => (
            <motion.div
              key={`${item.title}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
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
                  {item.category}
                </span>
                <p className="font-display text-sm tracking-wide text-foreground mt-1">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="font-narrative text-[11px] text-foreground/60 italic mt-0.5">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hidden Sigil — barely visible laurel, triggers riddle sequence */}
        <div className="flex justify-center mt-16 mb-4">
          <HiddenSigil />
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;
