import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Compass } from "lucide-react";
import { GUIDE_STORAGE_KEY } from "@/components/GuideOnboarding";
import { guideCharacters } from "@/data/world-data";

const navItems = [
  { path: "/", label: "Enter" },
  { path: "/world", label: "World" },
  { path: "/characters", label: "Characters" },
  { path: "/timeline", label: "Timeline" },
  { path: "/factions", label: "Factions" },
  { path: "/map", label: "Map" },
  { path: "/gallery", label: "Gallery" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const savedGuideId = localStorage.getItem(GUIDE_STORAGE_KEY);
  const activeGuide = guideCharacters.find((g) => g.id === savedGuideId);

  const handleChangeGuide = () => {
    localStorage.removeItem(GUIDE_STORAGE_KEY);
    window.location.reload();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
              <span className="font-display text-lg tracking-[0.2em] text-primary">
                LAUREL CROWNS
              </span>
              <span className="hidden sm:block text-xs tracking-[0.3em] text-muted-foreground uppercase">
                Above
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-xs tracking-[0.15em] uppercase transition-colors font-body ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {activeGuide && (
                <button
                  onClick={handleChangeGuide}
                  title={`Guide: ${activeGuide.name} · Click to change`}
                  className="ml-2 flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 text-primary/70 hover:border-primary hover:text-primary transition-colors"
                >
                  <Compass size={10} />
                  <span className="text-[9px] tracking-[0.15em] uppercase font-body">{activeGuide.name}</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger — 44×44 touch target */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="sm:hidden flex items-center justify-center w-11 h-11 text-foreground"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="sm:hidden fixed inset-0 z-[60] bg-background flex flex-col"
          >
            {/* Top bar with close button */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
              <span className="font-display text-base tracking-[0.2em] text-primary">
                LAUREL CROWNS
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-11 h-11 text-foreground"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Nav Links */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex-1 flex flex-col justify-center px-8 space-y-2"
            >
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center min-h-[54px] text-lg tracking-[0.15em] uppercase font-body border-b border-border/40 transition-colors ${
                      location.pathname === item.path
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {activeGuide && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-6"
                >
                  <button
                    onClick={handleChangeGuide}
                    className="flex items-center gap-3 min-h-[44px] text-base tracking-[0.12em] uppercase font-body text-primary/70 border border-primary/30 w-full px-4 py-3"
                  >
                    <Compass size={14} />
                    Change Guide ({activeGuide.name})
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Footer hint */}
            <div className="px-8 pb-8 text-[10px] tracking-[0.3em] text-muted-foreground/40 uppercase font-body">
              The Chronicles Quest — Explore to Discover
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
