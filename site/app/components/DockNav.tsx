"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";

const items = [
  { label: "关于我", href: "#about" },
  { label: "精选项目", href: "#projects" },
  { label: "实习经历", href: "#experience" },
  { label: "专业能力", href: "#capabilities" },
  { label: "联系", href: "#contact" },
];

const spring = { mass: 0.12, stiffness: 170, damping: 15 };

function DockNavItem({ label, href, mouseX }: { label: string; href: string; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const distance = useTransform(mouseX, (value) => {
    const rect = ref.current?.getBoundingClientRect();
    return rect ? value - (rect.left + rect.width / 2) : Number.POSITIVE_INFINITY;
  });
  const scaleTarget = useTransform(distance, [-150, 0, 150], [1, 1.2, 1]);
  const yTarget = useTransform(distance, [-150, 0, 150], [0, -5, 0]);
  const scale = useSpring(scaleTarget, spring);
  const y = useSpring(yTarget, spring);

  return <motion.a ref={ref} href={href} style={{ scale, y }}>{label}</motion.a>;
}

export default function DockNav() {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const reduceMotion = useReducedMotion();
  return (
    <nav
      className="dock-nav"
      aria-label="主导航"
      onMouseMove={(event) => mouseX.set(reduceMotion ? Number.POSITIVE_INFINITY : event.clientX)}
      onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
    >
      {items.map((item) => <DockNavItem key={item.href} {...item} mouseX={mouseX} />)}
    </nav>
  );
}
