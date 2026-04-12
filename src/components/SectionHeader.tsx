import { motion } from "framer-motion";
import { ReactNode } from "react";
import GoldDivider from "@/components/GoldDivider";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const SectionHeader = ({ title, subtitle, children }: SectionHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center mb-16"
  >
    <GoldDivider className="max-w-xs mx-auto mb-6" />
    <h2
      className="font-display text-3xl sm:text-4xl tracking-[0.1em] text-white"
      style={{ textShadow: "0 0 30px rgba(255,255,255,0.4), 0 2px 10px rgba(255,255,255,0.2)" }}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className="mt-4 font-narrative text-lg italic max-w-2xl mx-auto text-white/70"
        style={{ textShadow: "0 0 20px rgba(255,255,255,0.25)" }}
      >
        {subtitle}
      </p>
    )}
    {children}
    <GoldDivider className="max-w-xs mx-auto mt-6" />
  </motion.div>
);

export default SectionHeader;
