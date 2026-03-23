"use client";
import { useInView } from "@/hooks/useAnimations";

interface WordRevealProps {
  text: string;
  className?: string;
  staggerMs?: number;
  as?: "h2" | "h3" | "p";
}

export function WordReveal({ text, className = "", staggerMs = 60, as: Tag = "h2" }: WordRevealProps) {
  const { ref, inView } = useInView(0.15);
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden mr-[0.3em] last:mr-0"
        >
          <span
            className="inline-block"
            style={{
              transform: inView ? "translateY(0) rotate(0)" : "translateY(110%) rotate(4deg)",
              opacity: inView ? 1 : 0,
              transition: `transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease`,
              transitionDelay: `${i * staggerMs}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}
