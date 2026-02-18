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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display text-lg tracking-[0.2em] text-primary">
              LAUREL CROWNS
            </span>
            <span className="hidden sm:block text-xs tracking-[0.3em] text-muted-foreground uppercase">
              Above
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground p-2"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-b border-border"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 text-sm tracking-[0.15em] uppercase font-body ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {activeGuide && (
                <button
                  onClick={handleChangeGuide}
                  className="flex items-center gap-2 px-3 py-2 text-sm tracking-[0.15em] uppercase font-body text-primary/70 border border-primary/30 w-full mt-2"
                >
                  <Compass size={12} />
                  Change Guide ({activeGuide.name})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
