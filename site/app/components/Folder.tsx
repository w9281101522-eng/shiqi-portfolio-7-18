"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useState } from "react";

type FolderProps = {
  color?: string;
  size?: number;
  items?: ReactNode[];
  className?: string;
};

type FolderVariables = CSSProperties & {
  "--folder-color": string;
  "--folder-back-color": string;
  "--paper-1": string;
  "--paper-2": string;
  "--paper-3": string;
};

type FolderHostVariables = CSSProperties & {
  "--folder-scale": number;
};

type PaperVariables = CSSProperties & {
  "--magnet-x": string;
  "--magnet-y": string;
};

const darkenColor = (hex: string, percent: number) => {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) color = color.split("").map(char => char + char).join("");

  const number = Number.parseInt(color, 16);
  const channel = (shift: number) =>
    Math.max(0, Math.min(255, Math.floor(((number >> shift) & 0xff) * (1 - percent))));
  const value = (1 << 24) + (channel(16) << 16) + (channel(8) << 8) + channel(0);
  return `#${value.toString(16).slice(1).toUpperCase()}`;
};

export default function Folder({
  color = "#25A7F0",
  size = 1,
  items = [],
  className = "",
}: FolderProps) {
  const papers = [...items.slice(0, 3)];
  while (papers.length < 3) papers.push(null);

  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState(
    Array.from({ length: 3 }, () => ({ x: 0, y: 0 })),
  );

  const folderStyle: FolderVariables = {
    "--folder-color": color,
    "--folder-back-color": darkenColor(color, 0.12),
    "--paper-1": "#E9F5FA",
    "--paper-2": "#F6EEDB",
    "--paper-3": "#FFFFFF",
  };

  const resetPapers = () => setPaperOffsets(Array.from({ length: 3 }, () => ({ x: 0, y: 0 })));
  const toggleFolder = () => {
    setOpen(previous => {
      if (previous) resetPapers();
      return !previous;
    });
  };

  const movePaper = (event: PointerEvent<HTMLDivElement>, index: number) => {
    if (!open) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) * 0.13;
    const y = (event.clientY - (rect.top + rect.height / 2)) * 0.13;
    setPaperOffsets(previous => previous.map((offset, paperIndex) => paperIndex === index ? { x, y } : offset));
  };

  return (
    <div
      className={`rb-folder-host ${className}`.trim()}
      style={{ "--folder-scale": size } as FolderHostVariables}
    >
      <div className="rb-folder-stage">
        <div
          className={`rb-folder${open ? " open" : ""}`}
          style={folderStyle}
          onClick={toggleFolder}
          onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleFolder();
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={open}
          aria-label={open ? "收起灵感文件夹" : "打开灵感文件夹"}
        >
          <div className="rb-folder__back">
            {papers.map((item, index) => (
              <div
                key={index}
                className={`rb-paper rb-paper-${index + 1}`}
                onPointerMove={event => movePaper(event, index)}
                onPointerLeave={() => setPaperOffsets(previous => previous.map((offset, paperIndex) => paperIndex === index ? { x: 0, y: 0 } : offset))}
                style={{
                  "--magnet-x": `${paperOffsets[index].x}px`,
                  "--magnet-y": `${paperOffsets[index].y}px`,
                } as PaperVariables}
              >
                {item}
              </div>
            ))}
            <div className="rb-folder__front" />
            <div className="rb-folder__front rb-folder__front--right" />
          </div>
        </div>
      </div>
    </div>
  );
}
