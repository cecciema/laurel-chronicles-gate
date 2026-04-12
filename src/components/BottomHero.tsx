interface BottomHeroProps {
  src: string;
  alt?: string;
}

const BottomHero = ({ src, alt = "" }: BottomHeroProps) => (
  <div className="relative h-[50vh] w-full overflow-hidden">
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
    />
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(to bottom, hsl(220 15% 7%) 0%, transparent 30%, transparent 70%, hsl(220 15% 7%) 100%)",
      }}
    />
  </div>
);

export default BottomHero;
