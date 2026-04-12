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
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(to bottom, hsl(224 16% 6%) 0%, transparent 30%, transparent 70%, hsl(224 16% 6%) 100%)",
      }}
    />
  </div>
);

export default BottomHero;
