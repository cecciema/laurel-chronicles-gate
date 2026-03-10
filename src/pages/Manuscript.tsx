import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { isTouch } from "@/components/CustomCursor";

// ── Chapter data (extracted from Index) ─────────────────────────────────────
const CHAPTERS = [
  {
    id: "chapter-1",
    title: "The Departure",
    description:
      "In the quaint village of Willowbrook, young Elara discovers an ancient map that promises untold adventures beyond the Misty Mountains.",
    image: "/images/chapter1.webp",
  },
  {
    id: "chapter-2",
    title: "Whispers of the Forest",
    description:
      "Elara ventures into the enchanted forest, where she encounters mythical creatures and learns of a looming darkness threatening her world.",
    image: "/images/chapter2.webp",
  },
  {
    id: "chapter-3",
    title: "The Crystal Caves",
    description:
      "Guided by the stars, Elara navigates through treacherous crystal caves, unlocking secrets of her past and forging alliances with unexpected companions.",
    image: "/images/chapter3.webp",
  },
];
// We need to import the CHAPTERS array – let's inline it from Index.tsx
