import { useEffect, useRef } from "react";

// Detect touch-only devices (no hover support)
export const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const trail = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", move);

    let raf: number;
    const animate = () => {
      trail.current.x += (pos.current.x - trail.current.x) * 0.12;
      trail.current.y += (pos.current.y - trail.current.y) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x - 5}px, ${pos.current.y - 5}px)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trail.current.x - 14}px, ${trail.current.y - 14}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      {/* Inner dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-[10px] h-[10px] rounded-full pointer-events-none z-[999]"
        style={{ background: "hsl(38 80% 60%)", boxShadow: "0 0 8px hsl(38 80% 60%), 0 0 20px hsl(38 72% 50% / 0.5)" }}
      />
      {/* Outer ring */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 w-[28px] h-[28px] rounded-full pointer-events-none z-[998] border"
        style={{ borderColor: "hsl(38 72% 50% / 0.5)", boxShadow: "0 0 10px hsl(38 72% 50% / 0.2)" }}
      />
    </>
  );
};

export default CustomCursor;
