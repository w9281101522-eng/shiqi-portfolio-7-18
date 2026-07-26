"use client";

import { gsap } from "gsap";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type BubbleMenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  hoverStyles?: { bgColor?: string; textColor?: string };
};

type BubbleMenuProps = {
  items: BubbleMenuItem[];
  menuAriaLabel?: string;
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
};

export default function BubbleMenu({
  items,
  menuAriaLabel = "打开导航菜单",
  animationEase = "back.out(1.45)",
  animationDuration = 0.55,
  staggerDelay = 0.09,
}: BubbleMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const close = () => setOpen(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const pills = pillRefs.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (!overlay) return;

    if (open) {
      setMounted(true);
      gsap.set(overlay, { display: "grid", autoAlpha: 1 });
      gsap.killTweensOf([...pills, ...labels]);
      gsap.fromTo(
        pills,
        { scale: 0, rotation: 0, transformOrigin: "50% 50%" },
        {
          scale: 1,
          rotation: (index: number) => items[index]?.rotation ?? 0,
          duration: animationDuration,
          stagger: { each: staggerDelay, from: "start" },
          ease: animationEase,
        },
      );
      gsap.fromTo(
        labels,
        { y: 22, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.48, delay: 0.12, stagger: staggerDelay, ease: "power3.out" },
      );
      return;
    }

    if (!mounted) return;
    gsap.killTweensOf([...pills, ...labels]);
    gsap.to(labels, { y: 16, autoAlpha: 0, duration: 0.18, ease: "power2.in" });
    gsap.to(pills, {
      scale: 0,
      duration: 0.22,
      stagger: { each: 0.025, from: "end" },
      ease: "power2.in",
      onComplete: () => {
        gsap.set(overlay, { display: "none", autoAlpha: 0 });
        setMounted(false);
      },
    });
  }, [animationDuration, animationEase, items, mounted, open, staggerDelay]);

  return (
    <div className={`bubble-menu-root${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="bubble-menu-toggle"
        aria-label={open ? "关闭导航菜单" : menuAriaLabel}
        aria-expanded={open}
        aria-controls="bubble-menu-overlay"
        onClick={() => setOpen(value => !value)}
      >
        <span>{open ? "关闭" : "菜单"}</span>
        <i aria-hidden="true"><b /><b /></i>
      </button>

      <div
        ref={overlayRef}
        id="bubble-menu-overlay"
        className="bubble-menu-overlay"
        aria-hidden={!open}
        onClick={event => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <nav className="bubble-menu-pills" aria-label="展开导航">
          {items.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className="bubble-menu-pill"
              aria-label={item.ariaLabel ?? item.label}
              tabIndex={open ? 0 : -1}
              style={{
                "--bubble-rotation": `${item.rotation ?? 0}deg`,
                "--bubble-hover-bg": item.hoverStyles?.bgColor ?? "#21ffc0",
                "--bubble-hover-color": item.hoverStyles?.textColor ?? "#171717",
              } as CSSProperties}
              ref={element => {
                pillRefs.current[index] = element;
              }}
              onClick={close}
            >
              <span ref={element => {
                labelRefs.current[index] = element;
              }}>{item.label}</span>
              <small>{String(index + 1).padStart(2, "0")}</small>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
