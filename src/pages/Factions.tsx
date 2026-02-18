import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { HiddenOrb } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import { factions } from "@/data/world-data";

const Factions = () => {
  const [expanded, setExpanded] = useState<string | null>("crown");

  return (
    <Layout>
      <div className="pt-24 pb-20 px-4 overflow-x-hidden">
        <SectionHeader
          title="Factions & Powers"
          subtitle="Five forces locked in a struggle that will determine the empire's future"
        />

        <div className="max-w-4xl mx-auto space-y-4">
          {factions.map((faction) => (
            <motion.div
              key={faction.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === faction.id ? null : faction.id)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-secondary/30 transition-colors min-h-[64px]"
              >
                <div className="flex-1 pr-4">
                  <h3 className="font-display text-[1.0625rem] sm:text-lg tracking-wide text-foreground">
                    {faction.name}
                  </h3>
                  <p className="font-narrative text-sm text-primary italic mt-1 leading-[1.6]">
                    "{faction.motto}"
                  </p>
                </div>
                <span className="text-muted-foreground text-xl font-body flex-shrink-0 w-8 text-center">
                  {expanded === faction.id ? "−" : "+"}
                </span>
              </button>

              <AnimatePresence>
                {expanded === faction.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-6 space-y-4 relative">
                      <div className="steampunk-divider" />
                      {/* Hidden Orb 5 — tucked beside the divider, only first faction */}
                      {faction.id === "crown" && (
                        <HiddenOrb id={5} className="absolute top-4 right-2" />
                      )}
                      <p className="text-[0.9375rem] sm:text-sm text-foreground/70 font-body leading-[1.8]">
                        {faction.description}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div>
                          <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-1">
                            Leader
                          </h4>
                          <p className="text-[0.9375rem] sm:text-sm text-foreground font-body">{faction.leader}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-1">
                            Strength
                          </h4>
                          <p className="text-[0.9375rem] sm:text-sm text-foreground/70 font-body">{faction.strength}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-body mb-1">
                            Ideology
                          </h4>
                          <p className="text-[0.9375rem] sm:text-sm text-foreground/70 font-narrative italic leading-[1.8]">{faction.ideology}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Factions;
