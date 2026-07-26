"use client";

import { gsap } from "gsap";
import type { ElementType, ReactNode } from "react";
import { createElement, useEffect, useMemo, useRef, useState } from "react";

type TextTypeProps = {
  text: string | string[];
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  cursorCharacter?: ReactNode;
  cursorBlinkDuration?: number;
  cursorClassName?: string;
  startOnVisible?: boolean;
};

export default function TextType({
  text,
  as: Component = "span",
  typingSpeed = 46,
  initialDelay = 120,
  pauseDuration = 1600,
  deletingSpeed = 28,
  loop = false,
  className = "",
  showCursor = true,
  cursorCharacter = "▍",
  cursorBlinkDuration = 0.58,
  cursorClassName = "",
  startOnVisible = true,
}: TextTypeProps) {
  const textArray = useMemo(() => Array.isArray(text) ? text : [text], [text]);
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [visible, setVisible] = useState(!startOnVisible);
  const containerRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.22 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!showCursor || !cursorRef.current) return;
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
    return () => tween.kill();
  }, [cursorBlinkDuration, showCursor]);

  useEffect(() => {
    if (!visible) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = textArray[textIndex] ?? "";
    if (reduced) {
      setDisplayedText(target);
      return;
    }

    let timeout: number;
    if (!deleting && displayedText.length < target.length) {
      timeout = window.setTimeout(
        () => setDisplayedText(target.slice(0, displayedText.length + 1)),
        displayedText.length === 0 ? initialDelay : typingSpeed,
      );
    } else if (!deleting) {
      if (!loop && textIndex === textArray.length - 1) return;
      timeout = window.setTimeout(() => setDeleting(true), pauseDuration);
    } else if (displayedText.length > 0) {
      timeout = window.setTimeout(() => setDisplayedText(value => value.slice(0, -1)), deletingSpeed);
    } else {
      setDeleting(false);
      setTextIndex(index => (index + 1) % textArray.length);
    }
    return () => window.clearTimeout(timeout);
  }, [deleting, deletingSpeed, displayedText, initialDelay, loop, pauseDuration, textArray, textIndex, typingSpeed, visible]);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `text-type ${className}`.trim(),
      "aria-label": textArray[textIndex],
    },
    <span className="text-type__content" aria-hidden="true">{displayedText}</span>,
    showCursor && <span ref={cursorRef} className={`text-type__cursor ${cursorClassName}`.trim()} aria-hidden="true">{cursorCharacter}</span>,
  );
}
