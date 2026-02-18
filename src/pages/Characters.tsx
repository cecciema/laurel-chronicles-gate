import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { HiddenOrb } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import { characters } from "@/data/world-data";
import { characterImageMap } from "@/data/guide-images";

// Group an array into chunks of `size`
function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

// Detect column count by measuring the grid container's width
function getColCount(width: number): number {
  if (width < 640) return 2;
  if (width < 1024) return 3;
  return 5;
}

const Characters = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [cols, setCols] = useState(5);
  const selectedChar = characters.find((c) => c.id === selected);
  const gridRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Measure grid width to determine column count
  const measureCols = useCallback(() => {
    if (gridRef.current) {
      setCols(getColCount(gridRef.current.offsetWidth));
    }
  }, []);

  useEffect(() => {
    measureCols();
    const ro = new ResizeObserver(measureCols);
    if (gridRef.current) ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [measureCols]);

  // Scroll the panel into view smoothly when selection changes
  useEffect(() => {
    if (selected && panelRef.current) {
      const timer = setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selected]);

  const rows = chunk(characters, cols);
  const selectedIndex = characters.findIndex((c) => c.id === selected);
  const selectedRow = selectedIndex >= 0 ? Math.floor(selectedIndex / cols) : -1;
  const selectedColInRow = selectedIndex >= 0 ? selectedIndex % cols : 0;

  // Caret horizontal offset: center of the selected card's column
  const caretLeft = `calc(${selectedColInRow} * (100% / ${cols}) + (100% / ${cols} / 2) - 10px)`;

  return (
    <Layout>
      <div className="pt-24 pb-20 px-4 overflow-x-hidden">
        <div className="relative">
          <SectionHeader
            title="Character Database"
            subtitle="The key figures whose choices will shape the fate of Panterra"
          />
          <HiddenOrb id={4} className="absolute top-2 right-4 sm:right-12" />
        </div>

        {/* Outer grid ref — used only for width measurement */}
        <div ref={gridRef} className="max-w-6xl mx-auto">
          {rows.map((row, rowIdx) => {
            const isSelectedRow = rowIdx === selectedRow;
            return (
              <div key={rowIdx} className="mb-4">
                {/* Row of cards */}
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {row.map((char, colIdx) => {
                    const globalIdx = rowIdx * cols + colIdx;
                    return (
                      <motion.button
                        key={char.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: globalIdx * 0.07 }}
                        onClick={() => setSelected(char.id === selected ? null : char.id)}
                        className={`relative group overflow-hidden aspect-[2/3] border transition-all ${
                          selected === char.id
                            ? "border-primary shadow-glow"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <img
                          src={characterImageMap[char.image]}
                          alt={char.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="font-display text-[10px] sm:text-xs tracking-wider text-foreground leading-tight">
                            {char.name.split(" ")[0]}
                          </p>
                          <p className="text-[8px] sm:text-[10px] tracking-wider text-primary uppercase font-body mt-0.5">
                            {char.magistry ?? char.faction}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Inline detail panel — spliced below matching row */}
                <AnimatePresence>
                  {isSelectedRow && selectedChar && (
                    <motion.div
                      ref={panelRef}
                      key={`panel-${selected}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="relative mt-3"
                    >
                      {/* Caret — outer (border color) */}
                      <div
                        className="absolute -top-3 z-10 h-0 w-0 pointer-events-none"
                        style={{
                          left: caretLeft,
                          borderLeft: "10px solid transparent",
                          borderRight: "10px solid transparent",
                          borderBottom: "10px solid hsl(var(--border))",
                        }}
                      />
                      {/* Caret — inner (card bg color) */}
                      <div
                        className="absolute -top-[10px] z-20 h-0 w-0 pointer-events-none"
                        style={{
                          left: `calc(${selectedColInRow} * (100% / ${cols}) + (100% / ${cols} / 2) - 9px)`,
                          borderLeft: "9px solid transparent",
                          borderRight: "9px solid transparent",
                          borderBottom: "9px solid hsl(var(--card))",
                        }}
                      />

                      <div className="bg-card border border-border p-5 sm:p-8">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Portrait */}
                          <div className="w-full sm:w-44 mx-auto sm:mx-0 sm:flex-shrink-0 max-w-[160px]">
                            <img
                              src={characterImageMap[selectedChar.image]}
                              alt={selectedChar.name}
                              className="w-full aspect-[2/3] object-cover border border-border"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-4">
                            <div>
                              <p className="text-[10px] tracking-[0.3em] text-primary uppercase font-body">
                                {selectedChar.magistry ?? selectedChar.faction}
                              </p>
                              <h3 className="font-display text-[1.625rem] sm:text-2xl tracking-wide text-foreground mt-1">
                                {selectedChar.name}
                              </h3>
                              <p className="font-narrative text-[1.0625rem] sm:text-lg text-foreground/70 italic leading-[1.8]">
                                {selectedChar.title}
                              </p>
                            </div>

                            <div className="steampunk-divider" />

                            {selectedChar.philosophy && (
                              <div>
                                <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                                  Philosophy
                                </h4>
                                <p className="text-[0.9375rem] sm:text-sm text-foreground/80 font-narrative italic leading-[1.8]">
                                  "{selectedChar.philosophy}"
                                </p>
                              </div>
                            )}

                            <div>
                              <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                                Alignment
                              </h4>
                              <p className="text-[0.9375rem] sm:text-sm text-foreground/80 font-body leading-[1.8]">
                                {selectedChar.alignment}
                              </p>
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
                              <p className="text-[0.9375rem] sm:text-sm text-foreground/70 font-narrative leading-[1.8]">
                                {selectedChar.background}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-2">
                                Relationships
                              </h4>
                              <p className="text-[0.9375rem] sm:text-sm text-foreground/70 font-narrative leading-[1.8] italic">
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
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Characters;
