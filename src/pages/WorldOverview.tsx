import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { HiddenOrb } from "@/components/ChroniclesSystem";
import SectionHeader from "@/components/SectionHeader";
import { worldRegions } from "@/data/world-data";
import heroCityscape from "@/assets/hero-cityscape.jpg";
import { DeadCorridors } from "@/components/DeadCorridors";

const WorldOverview = () => {
  return (
    <Layout>
      {/* Hero */}
      <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
        <img src={heroCityscape} alt="The Empire" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
        <div className="absolute inset-0 flex items-end justify-center pb-10 sm:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-5"
          >
            <h1 className="font-display text-[1.75rem] sm:text-5xl tracking-[0.1em] text-foreground">
              THE WORLD
            </h1>
            <p className="mt-2 text-muted-foreground font-narrative italic text-base sm:text-lg leading-[1.8]">
              An empire forged in fire, held together by iron will
            </p>
          </motion.div>
        </div>
      </div>

      {/* Overview */}
      <section className="py-16 sm:py-20 px-5 sm:px-4">
        <div className="max-w-4xl mx-auto w-full">
          <SectionHeader
            title="The Empire of the Brass Crown"
            subtitle="Three centuries of dominion. An industrial civilization powered by the fires beneath the earth."
          />
          <div className="space-y-6 font-narrative text-[1.0625rem] sm:text-base text-foreground/80 leading-[1.8] relative">
            {/* Hidden Orb 1 — World page scroll */}
            <HiddenOrb id={1} className="absolute -right-1 top-1" />
            <p>
              The empire spans a vast continent, its cities connected by steam-powered rail lines
              and its skies darkened by the exhaust of a thousand factories. At its heart lies the
              Brass Citadel — a fortress-city of towering spires and intricate clockwork, where the
              Emperor rules from a throne of forged metal and ancient stone.
            </p>
            <p>
              Beneath the surface, the Deep Forge churns — a massive geothermal source that powers
              the empire's technology. Those who tend it speak of prophecies written in steam and
              fire. Those who rule above care only for the power it provides.
            </p>
            <p>
              But the empire is rotting from within. The gap between the gilded aristocracy and the
              soot-covered workers of the Lower Wards has never been wider. Resistance movements
              grow bolder. Whispers of revolution echo through the steam-filled corridors. And the
              Deep Forge itself grows increasingly unstable, as if the earth itself has grown tired
              of bearing the empire's weight.
            </p>
          </div>
        </div>
      </section>

      {/* Social Structure */}
      <section className="py-12 sm:py-16 px-5 sm:px-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <SectionHeader title="Social Hierarchy" subtitle="The empire's rigid class system shapes every life within its borders" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { tier: "The Crown & Court", desc: "The Emperor, aristocracy, and military elite. They live in opulence within the upper levels of the Citadel and the Gilded Hills, controlling technology, trade, and law.", level: "Upper Echelon" },
              { tier: "The Merchant Class", desc: "Factory owners, engineers, and traders who serve the empire's industrial needs. Tolerated but never truly accepted by the aristocracy, they occupy a precarious middle ground.", level: "Middle Tier" },
              { tier: "The Lower Wards", desc: "Workers, laborers, and the dispossessed. They power the empire's machinery with their bodies and their lives, living in smog-choked districts beneath the gleaming towers above.", level: "Foundation" },
            ].map((item, i) => (
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
                <h3 className="font-display text-lg tracking-wide text-foreground mt-2">
                  {item.tier}
                </h3>
                <p className="mt-3 text-[0.9375rem] sm:text-sm text-muted-foreground font-body leading-[1.8]">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="py-16 sm:py-20 px-5 sm:px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader title="Regions of the Empire" subtitle="Each territory tells a story of power, struggle, and survival" />
          <div className="space-y-6 sm:space-y-8">
            {worldRegions.map((region, i) => (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, x: 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-5 sm:p-6 bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] tracking-[0.3em] text-primary uppercase font-body">
                      {region.faction}
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

        <DeadCorridors />
    </Layout>
  );
};

export default WorldOverview;
