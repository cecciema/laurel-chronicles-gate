import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import SectionHeader from "@/components/SectionHeader";
import { characters } from "@/data/world-data";

import charEmperor from "@/assets/char-emperor.jpg";
import charRebel from "@/assets/char-rebel.jpg";
import charAristocrat from "@/assets/char-aristocrat.jpg";
import charSpymaster from "@/assets/char-spymaster.jpg";
import charEngineer from "@/assets/char-engineer.jpg";
import charOracle from "@/assets/char-oracle.jpg";

const imageMap: Record<string, string> = {
  "char-emperor": charEmperor,
  "char-rebel": charRebel,
  "char-aristocrat": charAristocrat,
  "char-spymaster": charSpymaster,
  "char-engineer": charEngineer,
  "char-oracle": charOracle,
};

const Characters = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedChar = characters.find((c) => c.id === selected);

  return (
    <Layout>
      <div className="pt-24 pb-20 px-4">
        <SectionHeader
          title="Character Database"
          subtitle="The key players whose choices will shape the empire's fate"
        />

        {/* Character Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {characters.map((char, i) => (
            <motion.button
              key={char.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(char.id)}
              className={`relative group overflow-hidden aspect-[2/3] border transition-all ${
                selected === char.id
                  ? "border-primary shadow-glow"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <img
                src={imageMap[char.image]}
                alt={char.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-display text-[10px] sm:text-xs tracking-wider text-foreground leading-tight">
                  {char.name.split(" ").slice(-1)}
                </p>
                <p className="text-[8px] sm:text-[10px] tracking-wider text-primary uppercase font-body mt-0.5">
                  {char.title}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Character Detail Panel */}
        <AnimatePresence>
          {selectedChar && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-4xl mx-auto mt-12"
            >
              <div className="bg-card border border-border p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-48 flex-shrink-0">
                    <img
                      src={imageMap[selectedChar.image]}
                      alt={selectedChar.name}
                      className="w-full aspect-[2/3] object-cover border border-border"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] tracking-[0.3em] text-primary uppercase font-body">
                        {selectedChar.faction}
                      </p>
                      <h3 className="font-display text-2xl tracking-wide text-foreground mt-1">
                        {selectedChar.name}
                      </h3>
                      <p className="font-narrative text-lg text-foreground/70 italic">
                        {selectedChar.title}
                      </p>
                    </div>

                    <div className="steampunk-divider" />

                    <div>
                      <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                        Alignment
                      </h4>
                      <p className="text-sm text-foreground/80 font-body">{selectedChar.alignment}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                        Personality
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedChar.personality.map((trait) => (
                          <span
                            key={trait}
                            className="text-[10px] tracking-wider bg-secondary text-foreground/70 px-2 py-1 font-body"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                        Background
                      </h4>
                      <p className="text-sm text-foreground/70 font-narrative leading-relaxed">
                        {selectedChar.background}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                        Relationships
                      </h4>
                      <p className="text-sm text-foreground/70 font-narrative leading-relaxed italic">
                        {selectedChar.relationships}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Characters;
