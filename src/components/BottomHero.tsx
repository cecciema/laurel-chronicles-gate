interface BottomHeroProps {
  src: string;
  alt?: string;
}

const BottomHero = ({ src, alt = "" }: BottomHeroProps) => (
  <div className="relative h-[25vh] sm:h-[50vh] w-full overflow-hidden">
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
    />
    {/* Light cool grade — ~half the intensity of the top hero */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "linear-gradient(135deg, hsl(288 30% 45% / 0.14) 0%, hsl(250 30% 22% / 0.10) 50%, hsl(185 38% 42% / 0.13) 100%)",
        mixBlendMode: "multiply",
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, hsl(288 30% 45% / 0.10), hsl(185 38% 42% / 0.10))",
        mixBlendMode: "overlay",
      }}
    />
    {/* Top/bottom fade into page background */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "linear-gradient(to bottom, hsl(250 18% 11%) 0%, transparent 30%, transparent 70%, hsl(250 18% 11%) 100%)",
      }}
    />
  </div>
);

export default BottomHero;
