import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroCityscape from "@/assets/hero-cityscape.jpg";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img
          src={heroCityscape}
          alt="The Empire"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <p className="text-xs tracking-[0.5em] text-primary/70 uppercase font-body mb-4">
            An Interactive World Experience
          </p>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-[0.08em] text-foreground leading-tight">
            LAUREL
            <br />
            <span className="text-brass-glow">CROWNS</span>
            <br />
            ABOVE
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <p className="mt-8 font-narrative text-lg sm:text-xl text-foreground/70 italic max-w-lg mx-auto">
            "In the shadow of brass towers and steam-choked skies, an empire
            holds its breath. The fire below is rising."
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/world"
            className="px-8 py-3 bg-primary text-primary-foreground font-display text-sm tracking-[0.2em] uppercase hover:shadow-glow transition-shadow"
          >
            Enter the Empire
          </Link>
          <Link
            to="/characters"
            className="px-8 py-3 border border-primary/40 text-foreground font-display text-sm tracking-[0.2em] uppercase hover:border-primary/80 transition-colors"
          >
            Meet the Players
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 steam-rise">
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase font-body">
              Scroll to Explore
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Teaser Sections Below Fold */}
      <div className="relative z-10 bg-background">
        {/* World teaser */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="steampunk-divider max-w-xs mx-auto mb-8" />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl sm:text-3xl tracking-[0.1em] text-foreground"
            >
              A WORLD ON THE EDGE
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 font-narrative text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              The empire was built on steam and iron, on the bones of the conquered
              and the dreams of the powerful. For three centuries, the Voss dynasty
              has maintained order through a machine of control — military, political,
              and technological. But the machine is breaking. The Lower Wards rumble
              with revolution. The aristocracy plays its lethal games. And deep
              beneath the capital, the fire that powers everything grows restless.
            </motion.p>
            <div className="steampunk-divider max-w-xs mx-auto mt-8" />
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { to: "/world", title: "World Overview", desc: "Explore the empire's territories, culture, and power structures" },
              { to: "/characters", title: "Character Database", desc: "Discover the key figures shaping the fate of the world" },
              { to: "/timeline", title: "Timeline", desc: "Trace the events that brought the empire to the brink" },
              { to: "/factions", title: "Factions", desc: "Understand the powers vying for control" },
              { to: "/map", title: "World Map", desc: "Navigate the regions of the empire" },
              { to: "/gallery", title: "Visual Gallery", desc: "Cinematic visions of the world" },
            ].map((card, i) => (
              <motion.div
                key={card.to}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={card.to}
                  className="block p-6 bg-card border border-border hover:border-primary/40 transition-all hover:shadow-brass group"
                >
                  <h3 className="font-display text-sm tracking-[0.15em] text-primary group-hover:text-brass-glow transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground font-body">
                    {card.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
