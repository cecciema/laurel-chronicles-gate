import { motion } from "framer-motion";
import { GUIDE_CONTENT, type GuidePage } from "@/data/guide-content";
import { characters } from "@/data/world-data";
import { characterImageMap } from "@/data/guide-images";

interface GuideWhisperProps {
  page: GuidePage;
}

const resolveImage = (image: string): string =>
  image.startsWith("/") ? image : (characterImageMap[image] ?? image);

const GuideWhisper = ({ page }: GuideWhisperProps) => {
  if (typeof window === "undefined") return null;

  const guideId = localStorage.getItem("selected-guide");
  if (!guideId) return null;

  const guideContent = GUIDE_CONTENT[guideId];
  if (!guideContent || !guideContent[page]) return null;

  const character = characters.find((c) => c.id === guideId);
  if (!character) return null;

  const imgSrc = resolveImage(character.image);
  const quote = guideContent[page];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-start gap-3 p-4 bg-card/60 border border-border/50 max-w-sm">
        <img
          src={imgSrc}
          alt={character.name}
          className="w-10 h-14 object-cover border border-border/50 flex-shrink-0"
        />
        <div className="flex flex-col">
          <span className="font-display text-[9px] tracking-[0.25em] uppercase text-primary">
            {character.name}
          </span>
          <span className="font-body text-[8px] text-muted-foreground mb-2">
            Your Guide
          </span>
          <div className="border-l-2 border-primary/40 pl-3">
            <p className="font-narrative italic text-[0.875rem] leading-[1.8] text-foreground/70">
              {quote}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GuideWhisper;
