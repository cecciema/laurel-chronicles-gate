import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { HiddenOrb } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import { timeline, type TimelineEvent } from "@/data/world-data";

const categoryColors: Record<TimelineEvent["category"], string> = {
  political: "bg-primary/20 text-primary",
  military: "bg-destructive/20 text-destructive",
  social: "bg-accent/20 text-accent",
  technological: "bg-brass-glow/20 text-brass-glow",
};

const Timeline = () => {
  const [filter, setFilter] = useState<TimelineEvent["category"] | "all">("all");
  const filtered = filter === "all" ? timeline : timeline.filter((e) => e.category === filter);

  return (
    <Layout>
      <div className="pt-24 pb-20 px-4 overflow-x-hidden">
        <SectionHeader
          title="Timeline of the Empire"
          subtitle="Three centuries of ambition, conflict, and transformation"
        />

        {/* Filter */}
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2 mb-12">
          {(["all", "political", "military", "social", "technological"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`min-h-[44px] px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-body border transition-colors ${
                filter === cat
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line — on mobile always left-aligned */}
          <div className="absolute left-5 sm:left-1/2 top-0 bottom-0 w-px bg-border" />
          {/* Hidden Orb 6 — camouflaged near the timeline line top */}
          <HiddenOrb id={6} className="absolute left-[14px] sm:left-[calc(50%-6px)] top-[-12px] z-20" />

          <div className="space-y-8">
            {filtered.map((event, i) => (
              <motion.div
                key={event.year + event.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative flex items-start"
              >
                {/* Dot */}
                <div className="absolute left-5 sm:left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-background rounded-full z-10 mt-1" />

                {/* Content — always left-indented on mobile */}
                <div className="ml-12 sm:ml-0 sm:w-[calc(50%-2rem)] sm:even:ml-auto sm:even:pl-8 sm:odd:pr-8 sm:odd:text-right w-full">
                  <span className={`inline-block px-2 py-0.5 text-[9px] tracking-wider uppercase font-body rounded-sm ${categoryColors[event.category]}`}>
                    {event.category}
                  </span>
                  <h3 className="font-display text-[0.9375rem] sm:text-sm tracking-wide text-foreground mt-2">
                    {event.title}
                  </h3>
                  <p className="text-[10px] tracking-[0.2em] text-primary font-body mt-1">
                    {event.year}
                  </p>
                  <p className="mt-2 text-[0.9375rem] sm:text-sm text-muted-foreground font-body leading-[1.8]">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Timeline;
