const GoldDivider = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <span className="text-[0.5rem] leading-none mb-1" style={{ color: "hsl(var(--gold-ancient))" }}>◆</span>
    <div className="gold-divider w-full" />
  </div>
);

export default GoldDivider;
