import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ParticleCanvas from "@/components/ParticleCanvas";
import { HiddenOrb } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import { SemperReview } from "@/components/SemperReview";
import { useIsMobile } from "@/hooks/use-mobile";
import GuideWhisper from "@/components/GuideWhisper";
import heroBg from "@/assets/botanical.jpg";

// ─── Event Data ─────────────────────────────────────────────────────────────────

type Category = "political" | "military" | "social" | "technological";
type Column = "left" | "right";

interface TimelineEvent {
  category: Category;
  year: string;
  title: string;
  description: string;
  column: Column;
  order: number; // vertical ordering across both columns
}

const events: TimelineEvent[] = [
  {
    category: "social",
    year: "Age Unknown",
    title: "Before the Veil",
    description:
      "The era before Panterra's protective systems. A world of raw ocean, untamed land, and pre-war civilizations whose knowledge would later be locked inside Pantheon archives. What people believed before the Cornerstones was never recorded. Or it was recorded and is no longer accessible.",
    column: "right",
    order: 0,
  },
  {
    category: "military",
    year: "Age of Ruin",
    title: "The Great War",
    description:
      "The war that ended the old world has no official start date in the Republic's records. The monarchy fell. The oceans turned. Bio-warfare consumed every continent except one. Panterra survived. The winning side wrote what came next. The losing side was not consulted.",
    column: "left",
    order: 1,
  },
  {
    category: "political",
    year: "Year 0",
    title: "The Founding of Panterra",
    description:
      "The Republic of Panterra is established as the last governed civilization on the planet. The Four Cornerstone Laws are written. Parliament and Sanctorium are named co-governing powers. The document establishing their equal authority has never been released to the public.",
    column: "left",
    order: 2,
  },
  {
    category: "political",
    year: "Year 62",
    title: "The Dual Reign Compact",
    description:
      "Parliament and Sanctorium formalize their co-governance in a compact that defines the boundaries of each institution's authority. The original text contains a fifth clause. The fifth clause has been redacted in every public copy ever produced.",
    column: "left",
    order: 3,
  },
  {
    category: "technological",
    year: "Year 89",
    title: "The Ocean Accords",
    description:
      "The Magistry of Ocean is formally chartered following evidence of accelerating ocean degradation. The first Paragon candidates are selected and trained for planetary recovery. The satellite maintenance program is formally tied to ocean recovery for the first time. The boundary coordinates of the satellite network are set. No public record explains why those specific coordinates were chosen.",
    column: "right",
    order: 4,
  },
  {
    category: "technological",
    year: "Year 119",
    title: "The Satellite Expansion",
    description:
      "The protective satellite network doubles in size. Parliament announces it as environmental protection from ultraviolet radiation. Sanctorium announces it as divine architecture honoring the cosmos. Neither institution explains why the expansion doubled the boundary perimeter rather than the coverage density.",
    column: "right",
    order: 5,
  },
  {
    category: "political",
    year: "Year 134",
    title: "The Language Purge",
    description:
      "Sanctorium locks away ancient texts deemed destabilizing to social order. Pantheon Ivory scholars become the sole authorized interpreters of pre-war knowledge. Dead languages are reclassified as restricted knowledge. Levilian is among them.",
    column: "left",
    order: 6,
  },
  {
    category: "social",
    year: "Year 156",
    title: "The First Marked Generation",
    description:
      "The first generation born entirely under the semper system comes of age. The last Citizens who remembered life before the mark have died. Panterra has no living memory of what it felt like to exist without one. The Cornerstones stop feeling like laws and start feeling like nature.",
    column: "right",
    order: 7,
  },
  {
    category: "military",
    year: "Year 178",
    title: "The Unmarking Orders",
    description:
      "Parliament quietly expands the list of authorized entities permitted to remove a Citizen's semper mark. The expansion is classified. The original list had two names on it. The expanded list has not been disclosed. The number of names it now contains is not public record.",
    column: "left",
    order: 8,
  },
  {
    category: "social",
    year: "Year 201",
    title: "The Apotheosis Covenant",
    description:
      "The Apotheosis ceremony is formalized as a sacred rite of passage rather than a civic obligation. The distinction matters to no one by this point - participation rates are already near total. Carmela's predecessor is appointed the first civilian ceremony orchestrator, marking the first time a non-Sol Deus holds full ceremonial authority over the transition rite.",
    column: "right",
    order: 9,
  },
  {
    category: "military",
    year: "Year 241",
    title: "The Rockfall Event",
    description:
      "A meteor shower strikes the far regions near the city of Rockfall during Sol Morrison's reign. The Pantheon Gods knew in advance. The public was told it was divine warning — punishment for sins inherited from the monarchy. The satellites held. The records of what the Pantheon Gods discussed beforehand were sealed the same week.",
    column: "left",
    order: 10,
  },
  {
    category: "technological",
    year: "Year 271",
    title: "The Succession Algorithm",
    description:
      "Parliament introduces a machine-assisted process for selecting its future leadership, presented to the public as the most objective system ever devised. Citizens watch the algorithm run live. Sanctorium endorses it unanimously and without condition. The algorithm's source code is classified as a state secret the same afternoon.",
    column: "right",
    order: 11,
  },
];

const categoryTagColors: Record<Category, { bg: string; text: string }> = {
  political: { bg: "hsl(38 50% 18% / 0.5)", text: "hsl(38 60% 55%)" },
  military: { bg: "hsl(0 50% 18% / 0.5)", text: "hsl(0 55% 50%)" },
  social: { bg: "hsl(35 30% 20% / 0.5)", text: "hsl(35 25% 70%)" },
  technological: { bg: "hsl(30 50% 18% / 0.5)", text: "hsl(30 60% 50%)" },
};

const filterBtnColors: Record<string, string> = {
  political: "border-primary text-primary",
  military: "border-primary text-primary",
  social: "border-primary text-primary",
  technological: "border-primary text-primary",
  all: "border-primary text-primary",
};

// ─── Event Card ─────────────────────────────────────────────────────────────────

const EventCard = ({
  event,
  side,
}: {
  event: TimelineEvent;
  side: "left" | "right";
}) => {
  const tag = categoryTagColors[event.category];
  const hoverBorder =
    side === "left"
      ? "hover:border-l-[2px]"
      : "hover:border-r-[2px]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className={`group py-4 px-1 border-l-[2px] border-r-[2px] border-transparent transition-colors duration-300 ${hoverBorder}`}
      style={{
        // @ts-ignore
        "--tw-border-opacity": 1,
        borderColor: "transparent",
      }}
      onMouseEnter={(e) => {
        if (side === "left") {
          e.currentTarget.style.borderLeftColor = "hsl(38 72% 50% / 0.25)";
        } else {
          e.currentTarget.style.borderRightColor = "hsl(38 72% 50% / 0.25)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderLeftColor = "transparent";
        e.currentTarget.style.borderRightColor = "transparent";
      }}
    >
      <span
        className="inline-block px-2 py-0.5 text-[9px] tracking-[0.2em] uppercase font-body rounded-sm mb-2"
        style={{ background: tag.bg, color: tag.text }}
      >
        {event.category}
      </span>
      <h3 className="font-display text-sm sm:text-[0.9375rem] tracking-wide text-primary">
        {event.title}
      </h3>
      <p className="text-[10px] tracking-[0.2em] uppercase font-body mt-1"
        style={{ color: "hsl(38 40% 45%)" }}>
        {event.year}
      </p>
      <p className="mt-2 text-sm sm:text-[0.9375rem] font-narrative leading-[1.85]"
        style={{ color: "hsl(35 20% 75%)" }}>
        {event.description}
      </p>
    </motion.div>
  );
};

// ─── Desktop Row (two-column) ───────────────────────────────────────────────────

const DesktopRow = ({
  event,
  showOrb,
}: {
  event: TimelineEvent;
  showOrb: boolean;
}) => {
  const isLeft = event.column === "left";

  return (
    <div className="relative grid grid-cols-[1fr_40px_1fr] items-start">
      {/* Left column */}
      <div className={isLeft ? "pr-6 text-right" : ""}>
        {isLeft && <EventCard event={event} side="left" />}
      </div>

      {/* Center connector */}
      <div className="relative flex items-start justify-center pt-5">
        {/* Horizontal connector line */}
        <div
          className="absolute top-[22px] h-px w-[18px]"
          style={{
            background: "hsl(38 72% 50% / 0.4)",
            left: isLeft ? "-2px" : "auto",
            right: isLeft ? "auto" : "-2px",
          }}
        />
        {/* Dot */}
        <div
          className="w-[10px] h-[10px] rounded-full border-2 z-10 relative"
          style={{
            borderColor: "hsl(38 72% 50% / 0.6)",
            background: "hsl(38 72% 50% / 0.2)",
          }}
        />
        {showOrb && (
          <HiddenOrb
            id={2}
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
          />
        )}
      </div>

      {/* Right column */}
      <div className={!isLeft ? "pl-6" : ""}>
        {!isLeft && <EventCard event={event} side="right" />}
      </div>
    </div>
  );
};

// ─── Mobile Row (single column, line on left) ───────────────────────────────────

const MobileRow = ({
  event,
  showOrb,
}: {
  event: TimelineEvent;
  showOrb: boolean;
}) => {
  return (
    <div className="relative flex items-start">
      {/* Dot on left line */}
      <div className="relative flex-shrink-0 w-7 flex justify-center pt-5">
        <div
          className="w-[10px] h-[10px] rounded-full border-2 z-10"
          style={{
            borderColor: "hsl(38 72% 50% / 0.6)",
            background: "hsl(38 72% 50% / 0.2)",
          }}
        />
        {/* Horizontal connector */}
        <div
          className="absolute top-[22px] left-[22px] h-px w-3"
          style={{ background: "hsl(38 72% 50% / 0.4)" }}
        />
        {showOrb && (
          <HiddenOrb id={2} className="absolute -top-3 left-1/2 -translate-x-1/2 z-20" />
        )}
      </div>
      {/* Card */}
      <div className="pl-4 flex-1">
        <EventCard event={event} side="right" />
      </div>
    </div>
  );
};

// ─── Main Timeline Page ─────────────────────────────────────────────────────────

const TimelinePage = () => {
  const [filter, setFilter] = useState<Category | "all">("all");
  const isMobile = useIsMobile();

  const filtered =
    filter === "all"
      ? events
      : events.filter((e) => e.category === filter);

  // Sort by order
  const sorted = [...filtered].sort((a, b) => a.order - b.order);

  // Orb appears near The Language Purge (order 6) or The Satellite Expansion (order 5)
  const orbIndex = sorted.findIndex(
    (e) => e.title === "The Language Purge" || e.title === "The Satellite Expansion"
  );

  return (
    <Layout>
      {/* Hero */}
      <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
        <img src={heroBg} alt="Timeline" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 via-60% to-background" />
        <ParticleCanvas density={0.5} />
      </div>

      <div className="pb-20 px-4 overflow-x-hidden">
        <SectionHeader
          title="Timeline of the Republic"
          subtitle="Three centuries of ambition, conflict, and transformation"
        />

        <div className="max-w-4xl mx-auto mb-8">
          <GuideWhisper page="timeline" />
        </div>

        {/* Filter buttons */}
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2 mb-12 sm:flex-nowrap">
          {(["all", "political", "military", "social", "technological"] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`min-h-[44px] px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-body border transition-colors ${
                  cat === "all" ? "w-full sm:w-auto" : "w-[calc(50%-0.25rem)] sm:w-auto"
                } ${
                  filter === cat
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical center line - stops before Present Hour */}
          {isMobile ? (
            <div
              className="absolute left-[13px] top-0 w-px"
              style={{ background: "hsl(38 72% 50% / 0.2)", bottom: 200 }}
            />
          ) : (
            <div
              className="absolute left-1/2 -translate-x-px top-0 w-px"
              style={{ background: "hsl(38 72% 50% / 0.2)", bottom: 200 }}
            />
          )}

          <div className="space-y-2 sm:space-y-1">
            {sorted.map((event, i) =>
              isMobile ? (
                <MobileRow
                  key={event.title}
                  event={event}
                  showOrb={i === orbIndex}
                />
              ) : (
                <DesktopRow
                  key={event.title}
                  event={event}
                  showOrb={i === orbIndex}
                />
              )
            )}
          </div>

          {/* Present Hour marker */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mt-16 flex flex-col items-center"
          >
            {/* Terminal dot */}
            <div
              className={`${
                isMobile ? "self-start ml-[8px]" : ""
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: "hsl(38 72% 50% / 0.6)",
                  boxShadow: "0 0 12px hsl(38 72% 50% / 0.3)",
                }}
              />
            </div>

            {/* Text - below dot with clear spacing */}
            <div
              className={`mt-6 ${
                isMobile ? "self-start pl-10" : "text-center"
              }`}
            >
              <p
                className="font-display text-[10px] sm:text-xs tracking-[0.25em] uppercase"
                style={{ color: "hsl(38 60% 55%)" }}
              >
                Year 293 - The Present Hour
              </p>
              <p
                className="font-narrative italic text-sm sm:text-[0.9375rem] leading-[1.85] mt-3 max-w-2xl mx-auto"
                style={{ color: "hsl(35 20% 65%)" }}
              >
                The ocean systems grow more unstable. Parliamentary authority and
                Pantheon power move toward inevitable collision. Secrets long
                buried in dead languages begin to surface. Everything is in
                motion.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Parliament intelligence unlock */}
        {typeof window !== "undefined" &&
          localStorage.getItem("parliament-intelligence-unlocked") === "true" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto mt-12 mb-4 border p-6 relative overflow-hidden"
              style={{
                borderColor: "hsl(0 60% 40% / 0.4)",
                background: "hsl(20 12% 7%)",
              }}
            >
              <div
                className="absolute top-3 right-4 font-display text-[9px] tracking-[0.3em] uppercase px-2 py-1 border"
                style={{
                  color: "hsl(0 65% 50%)",
                  borderColor: "hsl(0 60% 40% / 0.5)",
                  transform: "rotate(3deg)",
                }}
              >
                Restricted
              </div>
              <p
                className="font-display text-[8px] tracking-[0.4em] uppercase mb-3"
                style={{ color: "hsl(38 40% 40%)" }}
              >
                Classified Parliament Document
              </p>
              <p
                className="font-narrative italic text-[0.9375rem] leading-[1.85]"
                style={{ color: "hsl(38 25% 65%)" }}
              >
                "Premiere succession has been algorithmically managed since Year
                12 of the New Republic. No election since has been uninfluenced.
                The margin of influence has increased every cycle."
              </p>
            </motion.div>
          )}

        {/* Semper Review game section */}
        <div className="max-w-3xl mx-auto mt-16 mb-8">
          {/* Steampunk divider */}
          <div className="max-w-2xl mx-auto mb-12 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex items-center gap-2 px-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary/60">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" />
                <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1" />
                <path d="M10 2v4M10 14v4M2 10h4M14 10h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Title */}
          <div className="max-w-2xl mx-auto text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl sm:text-3xl tracking-[0.12em] text-primary"
            >
              The Semper Review
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-3 font-narrative italic text-muted-foreground text-[0.9375rem] leading-[1.8]"
            >
              A routine compliance check. Answer correctly. The Peace Officer is watching.
            </motion.p>
          </div>

          <SemperReview />
        </div>
      </div>
    </Layout>
  );
};

export default TimelinePage;
