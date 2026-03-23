import { useEffect, useRef, useState, useCallback } from 'react';

/* ═══ useInView — triggers once when element enters viewport ═══ */
export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) { setInView(true); return; }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.1) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/*
 * ═══ SCROLL REVEAL SYSTEM ═══
 * Uses CSS @keyframes with bounce/overshoot — NOT flat transitions.
 * Each direction has its own keyframe in globals.css:
 *   .reveal-up, .reveal-down, .reveal-left, .reveal-right,
 *   .reveal-scale, .reveal-blur, .reveal-rotate
 *
 * Hidden state is set inline, animation class is toggled on reveal.
 */

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur' | 'rotate';

const hiddenStyles: Record<RevealDirection, React.CSSProperties> = {
  up:     { opacity: 0, transform: 'translateY(60px) scale(0.96)' },
  down:   { opacity: 0, transform: 'translateY(-60px) scale(0.96)' },
  left:   { opacity: 0, transform: 'translateX(80px) rotate(2deg)' },
  right:  { opacity: 0, transform: 'translateX(-80px) rotate(-2deg)' },
  scale:  { opacity: 0, transform: 'scale(0.7)' },
  blur:   { opacity: 0, transform: 'scale(0.95)', filter: 'blur(12px)' },
  rotate: { opacity: 0, transform: 'rotate(6deg) translateY(40px)' },
};

const animClass: Record<RevealDirection, string> = {
  up:     'reveal-up',
  down:   'reveal-down',
  left:   'reveal-left',
  right:  'reveal-right',
  scale:  'reveal-scale',
  blur:   'reveal-blur',
  rotate: 'reveal-rotate',
};

export function useScrollReveal(
  direction: RevealDirection = 'up',
  delay = 0,
  threshold = 0.12
) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) { setRevealed(true); return; }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const className = revealed ? animClass[direction] : '';
  const style: React.CSSProperties = revealed
    ? { animationDelay: `${delay}ms` }
    : hiddenStyles[direction];

  return { ref, className, style, revealed };
}

/* ═══ useStaggerReveal — parent triggers children with bounce stagger ═══ */
export function useStaggerReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) { setRevealed(true); return; }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const getChildProps = useCallback((
    index: number,
    direction: RevealDirection = 'up',
    staggerMs = 100
  ) => {
    return {
      className: revealed ? animClass[direction] : '',
      style: (revealed
        ? { animationDelay: `${index * staggerMs}ms` }
        : hiddenStyles[direction]
      ) as React.CSSProperties,
    };
  }, [revealed]);

  return { ref, revealed, getChildProps };
}

/* ═══ useParallax — subtle parallax on scroll ═══ */
export function useParallax(speed = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let raf: number | null = null;

    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const viewCenter = window.innerHeight / 2;
          setOffset((center - viewCenter) * speed);
        }
        raf = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return { ref, offset };
}

/* ═══ useCounter — animated number ═══ */
export function useCounter(target: number, duration = 2000, inView = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return count;
}
