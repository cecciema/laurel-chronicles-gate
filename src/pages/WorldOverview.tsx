import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ParticleCanvas from "@/components/ParticleCanvas";
import Layout from "@/components/Layout";
import { HiddenOrb, useGame } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import heroBg from "@/assets/waterfall.jpg";
import { ForbiddenTransmission } from "@/components/ForbiddenTransmission";
import GuideWhisper from "@/components/GuideWhisper";

const cornerstoneLaws = [
  { numeral: "I", text: "Let there be One Republic, that the world may know peace and the wars of nations never rise again." },
  { numeral: "II", text: "Let each soul bear One Heir, that the earth may breathe and the burden of life remain light." },
  { numeral: "III", text: "Let all children belong to Panterra first, that no family may claim what the Republic has given." },
  { numeral: "IV", text: "Let every soul ascend at Apex, that suffering may end and the living may be spared its weight." },
];

const socialTiers = [
  {
    tier: "The Leaders",
    level: "Apex Authority",
    desc: "The twelve Sol Deos of Sanctorium and the elected Premiere of Parliament. They do not age visibly. They do not explain themselves. Their authority is total and their succession is sacred. Most Citizens will never stand in the same room as one of them.",
  },
  {
    tier: "The Citizens",
    level: "The Living",
    desc: "Those who have not yet reached Apex live here - in the Deep Forge, in the townships, in the schools and training grounds of the Republic. They are fed, educated, protected, and prepared. Their whole lives are a preparation for the choice that awaits them.",
  },
  {
    tier: "The Public Servants",
    level: "The Devoted",
    desc: "Those who chose service over Apotheosis. Their bodies and their time belong to the Republic. They serve in the Magistry sectors under Parliament, or as devotees and scholars in Sanctorium. It is considered an honor. It is also considered the harder path.",
  },
];

const regions = [
  {
    name: "The Deep Forge",
    tag: "FOUNDATION",
    description: "Where every Citizen of Panterra begins. The townships, the nurseries, the schools, the training grounds - all of it sits above the oldest infrastructure in the Republic. The forges beneath run day and night. Most people never ask what they are for. The children raised here grow up knowing the warmth of them but not the source. There is a reason this place is called what it is. Most people never find out.",
    features: ["Township Quarters", "Paragon Academies", "Republic Nurseries", "The Forge Districts"],
    hasOrb: true,
  },
  {
    name: "Parliament",
    tag: "THE GOVERNING BODY",
    description: "The Forum District is the beating heart of civic Panterra. Cannon Palace houses Parliament's chambers, Villa Marina is the Premiere's residence, and Plaza Montecito is where announcements are made to the people. Science, law, technology, and resource allocation all flow outward from here. If Sanctorium governs what happens after death, Parliament governs everything before it.",
    features: ["Cannon Palace", "Villa Marina", "Plaza Montecito", "The Magistry Sectors"],
  },
  {
    name: "Sanctorium",
    tag: "THE SPIRITUAL AUTHORITY",
    description: "Twelve Pantheons arranged across all four quadrants, each governed by a Sol Deus and their Lunary. The Grand Sanctuary at the center is the holiest site in Panterra - the seat of the Apotheosis ceremony and the court of divine authority. Access is tiered. Most Citizens see only the outer courts. What happens at the center is not discussed.",
    features: ["The Twelve Pantheons", "The Grand Sanctuary", "The Ivory Planetarium", "The Sacred Scrolls"],
  },
  {
    name: "The Ocean Reaches",
    tag: "MAGISTRY OF OCEAN - PARLIAMENT DIVISION",
    description: "The degraded ocean territories under the research and control of the Magistry of Ocean. What was once a living sea is now a black expanse of toxins and chemical waste - the inheritance of the Great War. Parliament funds ongoing recovery efforts. Progress has been slow for decades. Recently, something changed.",
    features: ["Research Stations", "Degraded Reef Systems", "Field Laboratories", "The Tide Markers"],
  },
  {
    name: "The Frontier Borderlands",
    tag: "UNCHARTED - PROCEED WITH CAUTION",
    description: "Beyond the Republic's governed edge lies what the maps describe as uninhabitable wasteland - scorching desert in the south, glacial ice in the north, and no infrastructure of any kind. Citizens are advised never to attempt crossing. A small number have tried over the years — those who refused Apotheosis and refused service both. The Republic's official record states that none survived. The Republic's official record has been wrong before.",
    features: ["Survivor Camps", "Pre-War Ruins", "Ungoverned Ocean Channels", "The Unmapped Interior"],
  },
];

const WorldOverview = () => {
  const { foundScrolls } = useGame();
  const transmissionWon = foundScrolls.includes(7);

  const [wasLocked, setWasLocked] = useState(!transmissionWon);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    if (transmissionWon && wasLocked) {
      setJustUnlocked(true);
      setWasLocked(false);
      const t = setTimeout(() => setJustUnlocked(false), 1200);
      return () => clearTimeout(t);
    }
  }, [transmissionWon, wasLocked]);

  const scrollToTransmission = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("forbidden-transmission")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      {/* Hero */}
      <div className="relative h-[56vh] sm:h-[70vh] overflow-hidden">
        <img src={heroBg} alt="Panterra" className="w-full h-full object-cover" style={{ objectPosition: "center top" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
        <ParticleCanvas density={0.5} />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-5"
          >
            <h1 className="font-display text-[2.625rem] sm:text-[4.6875rem] tracking-[0.1em] text-foreground">
              PANTERRA
            </h1>
            <p className="mt-2 text-muted-foreground font-narrative italic text-xl sm:text-2xl leading-[1.8]">
              The last continent. The only civilization. Or so they were told.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Intro */}
      <section className="py-16 sm:py-20 px-5 sm:px-4">
        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6 font-narrative text-[1.0625rem] sm:text-lg text-muted-foreground leading-[1.8] relative">
            <p>
              Beyond Panterra's borders, the world is dead. Bio-warfare consumed every other continent during the Great War, leaving behind a black sea laced with toxins and a wasteland no living thing has crossed in generations. The satellites above maintain a protective boundary against ultraviolet radiation. Without them, Panterra would follow. Everyone knows this. It is the first thing children are taught.
            </p>
            <p>
              Inside the boundary, life is ordered, purposeful, and finite. Two institutions govern everything: Parliament, which controls the body - science, technology, resource allocation, civic law - and Sanctorium, which governs the soul - faith, ceremony, the passage between lives. Together they are called the Dual Reign. Together they have kept Panterra alive for nearly three hundred years.
            </p>
            <p>
              Every Citizen is born into the system. Every Citizen lives within it. And every Citizen, at the moment their body reaches its Apex, makes the only choice that has ever truly been theirs.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8">
          <GuideWhisper page="world" />
        </div>

        {/* Deep Forge survival unlock */}
        {typeof window !== "undefined" && localStorage.getItem("deepforge-survival-unlocked") === "true" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 border p-6 relative max-w-4xl mx-auto"
            style={{ borderColor: "hsl(25 60% 30% / 0.4)", background: "hsl(20 12% 7%)" }}
          >
            <p className="font-display text-[8px] tracking-[0.4em] uppercase mb-3" style={{ color: "hsl(25 60% 40%)" }}>
              Worn Handwritten Document - Deep Forge Communities
            </p>
            <p className="font-narrative italic text-[0.9375rem] leading-[1.85]" style={{ color: "hsl(38 25% 65%)" }}>
              "The Deep Forge communities have maintained an oral record of every person lost to incomplete Apotheosis since Year 4 of the New Republic. The number is 1,847. The official record shows 214."
            </p>
          </motion.div>
        )}
      </section>

      {/* The Four Cornerstone Laws */}
      <section className="py-12 sm:py-16 px-5 sm:px-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            title="THE FOUR CORNERSTONE LAWS"
            subtitle="Inscribed at the founding. Never amended. Never questioned."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cornerstoneLaws.map((law, i) => (
              <motion.div
                key={law.numeral}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative p-6 sm:p-8 border border-border bg-card overflow-hidden"
                style={{
                  backgroundImage: "radial-gradient(ellipse at 30% 20%, hsl(38 20% 14% / 0.5) 0%, transparent 70%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(38 30% 50% / 0.15) 2px, transparent 4px), repeating-linear-gradient(90deg, transparent, transparent 3px, hsl(38 30% 50% / 0.1) 3px, transparent 6px)",
                  }}
                />
                <span
                  className="absolute top-3 right-4 font-display text-[3rem] sm:text-[4rem] leading-none pointer-events-none select-none"
                  style={{ color: "hsl(38 50% 40% / 0.12)" }}
                >
                  {law.numeral}
                </span>
                <p className="font-display text-[10px] tracking-[0.35em] uppercase mb-4" style={{ color: "hsl(38 50% 45%)" }}>
                  Law {law.numeral}
                </p>
                <p className="font-display text-[0.9375rem] sm:text-base leading-[1.9] text-foreground/85 tracking-wide relative z-10">
                  "{law.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Structure — The Order of Panterra */}
      <section className="py-16 sm:py-20 px-5 sm:px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader title="THE ORDER OF PANTERRA" subtitle="Every Citizen has a place. Every place has a purpose." />
          <div className="space-y-6">
            {socialTiers.map((item, i) => (
              <motion.div
                key={item.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 bg-card border border-border"
              >
                <span className="text-[10px] tracking-[0.3em] text-primary uppercase font-body">
                  {item.level}
                </span>
                <h3 className="font-display text-base tracking-wide text-foreground mt-2">
                  {item.tier}
                </h3>
                <p className="mt-3 text-[0.9375rem] sm:text-sm text-muted-foreground font-body leading-[1.8]">
                  {item.desc}
                </p>
              </motion.div>
            ))}

            {/* ── The Convoy - Fourth Tier ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
              className="p-6 border transition-all duration-1000"
              style={{
                background: transmissionWon ? "hsl(var(--card))" : "hsl(0 10% 6%)",
                borderColor: transmissionWon ? "hsl(38 72% 50% / 0.3)" : "hsl(0 40% 25% / 0.4)",
                boxShadow: transmissionWon ? "0 0 20px hsl(38 72% 50% / 0.08)" : "none",
              }}
            >
              {/* Tag — always fully visible */}
              <span
                className="text-[10px] tracking-[0.3em] uppercase font-body transition-colors duration-1000"
                style={{ color: transmissionWon ? "hsl(38 50% 45%)" : "hsl(0 50% 40%)" }}
              >
                {transmissionWon ? "RECORD RESTORED - CLASSIFIED" : "UNVERIFIED - RECORD DISPUTED"}
              </span>

              {/* Blurrable content */}
              <div
                className="transition-all duration-1000"
                style={{
                  filter: transmissionWon ? "blur(0px)" : "blur(4px)",
                  opacity: transmissionWon ? 1 : 0.4,
                }}
              >
                <h3 className="font-display text-base tracking-wide text-foreground/70 mt-2">
                  The Convoy
                </h3>
                <p className="mt-3 text-[0.9375rem] sm:text-sm text-muted-foreground font-body leading-[1.8]">
                  They have no Pantheon. They have no Magistry sector. They hold no seat in Parliament and no pew in any Sol Deus court. They exist in the gaps between the official record — in the unmarked years, the redacted clauses, the Citizens who disappeared without an Apotheosis filing. The Convoy of Reformation has been called a rumor for so long that most people stopped asking whether the rumor was true. It is true. It has always been true. They did not form in response to the system. Some believe they helped build it.
                </p>
              </div>

              {/* Below-blur messaging */}
              <div className="mt-4">
                {transmissionWon ? (
                  <p
                    className="font-narrative italic text-[0.875rem] transition-opacity duration-1000"
                    style={{ color: "hsl(38 40% 55%)" }}
                  >
                    Transmission decoded. Record restored.
                  </p>
                ) : (
                  <>
                    <p
                      className="font-narrative italic text-[0.875rem]"
                      style={{ color: "hsl(38 25% 55%)" }}
                    >
                      This record has been intercepted. Decode the transmission to access it.
                    </p>
                    <button
                      onClick={scrollToTransmission}
                      className="mt-2 font-display text-[10px] tracking-[0.3em] uppercase transition-colors hover:underline"
                      style={{ color: "hsl(38 72% 50% / 0.7)" }}
                    >
                      ↓ Forbidden Transmission
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="py-16 sm:py-20 px-5 sm:px-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <SectionHeader title="THE REGIONS OF PANTERRA" subtitle="Five territories. One Republic. Not everyone agrees on what that means." />
          <div className="space-y-6 sm:space-y-8">
            {regions.map((region) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, x: 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-5 sm:p-6 bg-card border border-border hover:border-primary/30 transition-colors relative"
              >
                {region.hasOrb && <HiddenOrb id={1} className="absolute -right-1 top-1" />}
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] tracking-[0.3em] text-primary uppercase font-body">
                      {region.tag}
                    </span>
                    <h3 className="font-display text-xl tracking-wide text-foreground mt-1">
                      {region.name}
                    </h3>
                    <p className="mt-3 text-[0.9375rem] sm:text-sm text-muted-foreground font-body leading-[1.8]">
                      {region.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {region.features.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] tracking-wider text-foreground/60 bg-secondary px-2 py-1 font-body"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div id="forbidden-transmission">
        <ForbiddenTransmission />
      </div>
    </Layout>
  );
};

export default WorldOverview;
