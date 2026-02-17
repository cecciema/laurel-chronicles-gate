import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SectionHeader from "@/components/SectionHeader";

import heroCityscape from "@/assets/hero-cityscape.jpg";
import worldMap from "@/assets/world-map.jpg";
import gearsTexture from "@/assets/gears-texture.jpg";
import charEmperor from "@/assets/char-emperor.jpg";
import charRebel from "@/assets/char-rebel.jpg";
import charAristocrat from "@/assets/char-aristocrat.jpg";
import charSpymaster from "@/assets/char-spymaster.jpg";
import charEngineer from "@/assets/char-engineer.jpg";
import charOracle from "@/assets/char-oracle.jpg";

const galleryItems = [
  { src: heroCityscape, title: "The Brass Citadel Skyline", category: "Environment" },
  { src: charEmperor, title: "Emperor Aldric Voss", category: "Character" },
  { src: charAristocrat, title: "Lady Seraphine Duval", category: "Character" },
  { src: gearsTexture, title: "Imperial Machinery", category: "Detail" },
  { src: charSpymaster, title: "Corvus Nyx — The Shadow Architect", category: "Character" },
  { src: worldMap, title: "Empire Territorial Map", category: "Cartography" },
  { src: charRebel, title: "Commander Kael Ashford", category: "Character" },
  { src: charEngineer, title: "Wren Gallagher — The Forgeborn", category: "Character" },
  { src: charOracle, title: "Lienna Ashvale — The Ember Oracle", category: "Character" },
];

const Gallery = () => {
  return (
    <Layout>
      <div className="pt-24 pb-20 px-4">
        <SectionHeader
          title="Visual Gallery"
          subtitle="Cinematic visions from the world of Laurel Crowns Above"
        />

        <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {galleryItems.map((item, i) => (
            <motion.div
              key={i}
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;
