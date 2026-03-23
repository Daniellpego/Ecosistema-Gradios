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

/* ═══ useScrollReveal — per-element reveal with CSS class injection ═══ */
export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur' | 'rotate';

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
    if (rect.top < window.innerHeight * 0.95) {
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

  const baseHidden: Record<RevealDirection, string> = {
    up: 'translate-y-12 opacity-0',
    down: '-translate-y-12 opacity-0',
    left: 'translate-x-16 opacity-0',
    right: '-translate-x-16 opacity-0',
    scale: 'scale-90 opacity-0',
    blur: 'opacity-0 blur-sm',
    rotate: 'opacity-0 rotate-3',
  };

  const shown = 'translate-x-0 translate-y-0 scale-100 opacity-100 blur-0 rotate-0';

  const className = revealed ? shown : baseHidden[direction];
  const style = {
    transitionProperty: 'transform, opacity, filter',
    transitionDuration: '800ms',
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}ms`,
  };

  return { ref, className, style, revealed };
}

/* ═══ useStaggerReveal — parent container that triggers children stagger ═══ */
export function useStaggerReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) { setRevealed(true); return; }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
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
    const baseHidden: Record<RevealDirection, string> = {
      up: 'translate-y-10 opacity-0 scale-[0.97]',
      down: '-translate-y-10 opacity-0 scale-[0.97]',
      left: 'translate-x-14 opacity-0',
      right: '-translate-x-14 opacity-0',
      scale: 'scale-75 opacity-0',
      blur: 'opacity-0 blur-md',
      rotate: 'opacity-0 -rotate-3 translate-y-6',
    };
    const shown = 'translate-x-0 translate-y-0 scale-100 opacity-100 blur-0 rotate-0';

    return {
      className: revealed ? shown : baseHidden[direction],
      style: {
        transitionProperty: 'transform, opacity, filter',
        transitionDuration: '700ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: revealed ? `${index * staggerMs}ms` : '0ms',
      } as React.CSSProperties,
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
