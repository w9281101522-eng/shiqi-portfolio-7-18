"use client";

import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";

type FallingTextProps = {
  lines: Array<{ text: string; className?: string }>;
  className?: string;
  gravity?: number;
  mouseConstraintStiffness?: number;
};

export default function FallingText({
  lines,
  className = "",
  gravity = 0.32,
  mouseConstraintStiffness = 0.72,
}: FallingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStarted(true);
  };

  useEffect(() => {
    if (!started || !containerRef.current || !targetRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvasContainer = canvasRef.current;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const { Engine, Render, Runner, Bodies, Body, Mouse, MouseConstraint, Composite } = Matter;
    const engine = Engine.create();
    engine.world.gravity.y = gravity;
    const render = Render.create({
      element: canvasContainer,
      engine,
      options: { width: rect.width, height: rect.height, background: "transparent", wireframes: false },
    });
    const boundaries = { isStatic: true, render: { fillStyle: "transparent" } };
    const floor = Bodies.rectangle(rect.width / 2, rect.height + 20, rect.width, 40, boundaries);
    const left = Bodies.rectangle(-20, rect.height / 2, 40, rect.height, boundaries);
    const right = Bodies.rectangle(rect.width + 20, rect.height / 2, 40, rect.height, boundaries);
    const ceiling = Bodies.rectangle(rect.width / 2, -20, rect.width, 40, boundaries);
    const words = Array.from(targetRef.current.querySelectorAll<HTMLElement>(".falling-word"));
    const wordBodies = words.map((element, index) => {
      const wordRect = element.getBoundingClientRect();
      const x = wordRect.left - rect.left + wordRect.width / 2;
      const y = wordRect.top - rect.top + wordRect.height / 2;
      const baseLane = (index * 0.61803398875 + 0.13) % 1;
      const lane = Math.min(0.95, Math.max(0.05, baseLane + (Math.random() - 0.5) * 0.24));
      const targetX = wordRect.width / 2 + 12 + lane * Math.max(0, rect.width - wordRect.width - 24);
      const body = Bodies.rectangle(x, y, wordRect.width, wordRect.height, {
        render: { fillStyle: "transparent" }, restitution: 0.78, friction: 0.1, frictionAir: 0.006,
      });
      const horizontalVelocity = Math.max(-7, Math.min(7, (targetX - x) * 0.032));
      Body.setAngle(body, (Math.random() - 0.5) * 0.1);
      Body.setVelocity(body, { x: horizontalVelocity + (Math.random() - 0.5) * 1.4, y: -0.35 - Math.random() * 0.9 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.transform = "translate(-50%, -50%)";
      return { element, body };
    });

    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: mouseConstraintStiffness, render: { visible: false } },
    });
    Composite.add(engine.world, [floor, left, right, ceiling, mouseConstraint, ...wordBodies.map(({ body }) => body)]);
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
    let frame = 0;
    const update = () => {
      wordBodies.forEach(({ element, body }) => {
        element.style.left = `${body.position.x}px`;
        element.style.top = `${body.position.y}px`;
        element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
      Render.stop(render);
      Runner.stop(runner);
      render.canvas.remove();
      Composite.clear(engine.world, false, true);
      Engine.clear(engine);
    };
  }, [gravity, mouseConstraintStiffness, started]);

  return (
    <div
      ref={containerRef}
      className={`falling-text-container ${started ? "is-falling" : ""} ${className}`.trim()}
      role="button"
      tabIndex={0}
      aria-label="点击让结尾文字落下"
      onClick={start}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); start(); } }}
    >
      <div ref={targetRef} className="falling-text-target">
        {lines.map((line, lineIndex) => (
          <div className={`falling-line ${line.className ?? ""}`.trim()} key={`${line.text}-${lineIndex}`}>
            {line.text.split(" ").map((word, wordIndex) => <span className="falling-word" key={`${word}-${wordIndex}`}>{word}</span>)}
          </div>
        ))}
      </div>
      <div ref={canvasRef} className="falling-text-canvas" aria-hidden="true" />
    </div>
  );
}
