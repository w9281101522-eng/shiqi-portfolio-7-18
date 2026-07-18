"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const menuItems = [
  { label: "关于我", english: "About", href: "#about" },
  { label: "精选项目", english: "Selected Work", href: "#projects" },
  { label: "实习经历", english: "Experience", href: "#experience" },
  { label: "专业能力", english: "Capabilities", href: "#capabilities" },
  { label: "联系我", english: "Contact", href: "#contact" },
];

export default function StaggeredMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`staggered-menu${open ? " is-open" : ""}`}>
      <button
        className="menu-button sm-menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="staggered-menu-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sm-menu-toggle-copy">{open ? "关闭" : "菜单"}</span>
        <span className="sm-menu-icon" aria-hidden="true"><span /><span /></span>
      </button>

      <button className="sm-menu-scrim" aria-label="关闭菜单" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} />
      <div className="sm-menu-underlays" aria-hidden="true"><span /><span /></div>

      <aside id="staggered-menu-panel" className="sm-menu-panel" aria-hidden={!open}>
        <div className="sm-menu-meta"><span>WSQ / NAVIGATION</span><small>PORTFOLIO · 2026</small></div>
        <nav className="sm-menu-links" aria-label="展开导航">
          {menuItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              style={{ "--sm-index": index } as CSSProperties}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            >
              <small>{String(index + 1).padStart(2, "0")}</small>
              <span>{item.label}</span>
              <em>{item.english}</em>
            </a>
          ))}
        </nav>
        <div className="sm-menu-footer"><span>AVAILABLE FOR UX / UI INTERNSHIP</span><a href="mailto:3619554001@qq.com">3619554001@qq.com ↗</a></div>
      </aside>
    </div>
  );
}
