import { motion } from "framer-motion";
import { ReactNode } from "react";

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
    <div className="steampunk-divider max-w-xs mx-auto mb-6" />
    <h2 className="font-display text-3xl sm:text-4xl tracking-[0.1em] text-foreground">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-4 text-muted-foreground font-narrative text-lg italic max-w-2xl mx-auto">
        {subtitle}
      </p>
    )}
    {children}
    <div className="steampunk-divider max-w-xs mx-auto mt-6" />
  </motion.div>
);

export default SectionHeader;
