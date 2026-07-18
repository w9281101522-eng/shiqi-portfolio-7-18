"use client";

import type { ReactNode } from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
};

export function ScrollStackItem({ children, itemClassName = "" }: { children: ReactNode; itemClassName?: string }) {
  return <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>;
}

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 120,
  itemScale = 0.035,
  itemStackDistance = 28,
  stackPosition = "17%",
  scaleEndPosition = "8%",
  baseScale = 0.9,
  rotationAmount = 0.28,
  blurAmount = 0,
}: ScrollStackProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const parsePosition = useCallback((value: string, height: number) =>
    value.includes("%") ? (Number.parseFloat(value) / 100) * height : Number.parseFloat(value), []);

  const update = useCallback(() => {
    const root = stackRef.current;
    if (!root || window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(":scope > .scroll-stack-inner > .scroll-stack-card"));
    const end = root.querySelector<HTMLElement>(".scroll-stack-end");
    if (!cards.length || !end) return;
    const documentTop = (element: HTMLElement) => {
      let top = 0;
      let node: HTMLElement | null = element;
      while (node) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
      return top;
    };

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const stackPositionPx = parsePosition(stackPosition, viewportHeight);
    const scaleEndPositionPx = parsePosition(scaleEndPosition, viewportHeight);
    const endTop = documentTop(end);
    let topCardIndex = 0;

    cards.forEach((card, index) => {
      const cardTop = documentTop(card);
      if (scrollTop >= cardTop - stackPositionPx - itemStackDistance * index) topCardIndex = index;
    });

    cards.forEach((card, index) => {
      const cardTop = documentTop(card);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * index;
      const triggerEnd = Math.max(triggerStart + 1, cardTop - scaleEndPositionPx);
      const pinEnd = endTop - viewportHeight * 0.56;
      const progress = Math.min(1, Math.max(0, (scrollTop - triggerStart) / (triggerEnd - triggerStart)));
      const targetScale = Math.min(1, baseScale + index * itemScale);
      const scale = 1 - progress * (1 - targetScale);
      const rotation = index * rotationAmount * progress * (index % 2 ? 1 : -1);
      const depth = Math.max(0, topCardIndex - index);
      let translateY = 0;

      if (scrollTop >= triggerStart && scrollTop <= pinEnd) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * index;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * index;
      }

      card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${rotation.toFixed(3)}deg)`;
      card.style.filter = blurAmount && depth ? `blur(${(depth * blurAmount).toFixed(2)}px)` : "";
    });
  }, [baseScale, blurAmount, itemScale, itemStackDistance, parsePosition, rotationAmount, scaleEndPosition, stackPosition]);

  useLayoutEffect(() => {
    const root = stackRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(":scope > .scroll-stack-inner > .scroll-stack-card"));
    cards.forEach((card, index) => { card.style.marginBottom = index < cards.length - 1 ? `${itemDistance}px` : "0"; });

    const requestUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(() => { frameRef.current = null; update(); });
    };
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [itemDistance, update]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={stackRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" aria-hidden="true" />
      </div>
    </div>
  );
}
