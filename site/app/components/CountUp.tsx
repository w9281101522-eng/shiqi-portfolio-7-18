"use client";

import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type CountUpProps = {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
};

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 0.95,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(direction === "down" ? to : from);
  const springValue = useSpring(motionValue, {
    damping: 30 * (1 / duration),
    stiffness: 230 * (1 / duration),
  });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const card = element.closest<HTMLElement>(".scroll-stack-card");
    const simpleLayout = window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)").matches;

    if (card && !simpleLayout) {
      const activate = () => {
        if (card.dataset.countActive === "true") setIsInView(true);
      };
      activate();
      card.addEventListener("stackactivate", activate);
      return () => card.removeEventListener("stackactivate", activate);
    }

    const target = card ?? element;
    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        setIsInView(true);
        observer.disconnect();
      },
      { threshold: 0.55 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const getDecimalPlaces = (num: number) => {
    const decimals = num.toString().split(".")[1];
    return decimals && Number.parseInt(decimals, 10) !== 0 ? decimals.length : 0;
  };
  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number) => {
      const formatted = Intl.NumberFormat("en-US", {
        useGrouping: Boolean(separator),
        minimumFractionDigits: maxDecimals,
        maximumFractionDigits: maxDecimals,
      }).format(latest);
      return separator ? formatted.replace(/,/g, separator) : formatted;
    },
    [maxDecimals, separator],
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(direction === "down" ? to : from);
    }
  }, [direction, formatValue, from, to]);

  useEffect(() => {
    if (!isInView || !startWhen) return;
    if (shouldReduceMotion) {
      motionValue.jump(direction === "down" ? from : to);
      return;
    }

    onStart?.();
    const timeoutId = window.setTimeout(
      () => motionValue.set(direction === "down" ? from : to),
      delay * 1000,
    );
    const durationTimeoutId = window.setTimeout(() => onEnd?.(), (delay + duration) * 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(durationTimeoutId);
    };
  }, [
    delay,
    direction,
    duration,
    from,
    isInView,
    motionValue,
    onEnd,
    onStart,
    shouldReduceMotion,
    startWhen,
    to,
  ]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", latest => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });
    return unsubscribe;
  }, [formatValue, springValue]);

  return <span className={className} ref={ref} />;
}
