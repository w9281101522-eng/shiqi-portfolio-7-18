"use client";

import React, { useEffect, useRef, useState } from "react";

type FuzzyTextProps = {
  children: React.ReactNode;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  enableHover?: boolean;
  baseIntensity?: number;
  hoverIntensity?: number;
  fuzzRange?: number;
  fps?: number;
  transitionDuration?: number;
  gradient?: string[] | null;
  letterSpacing?: number;
  className?: string;
};

export default function FuzzyText({
  children,
  fontSize = "clamp(21px, 1.55vw, 27px)",
  fontWeight = 600,
  fontFamily = "inherit",
  color = "#292629",
  enableHover = true,
  baseIntensity = 0.055,
  hoverIntensity = 0.27,
  fuzzRange = 18,
  fps = 60,
  transitionDuration = 420,
  gradient = null,
  letterSpacing = 0,
  className = "",
}: FuzzyTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resizeVersion, setResizeVersion] = useState(0);
  const text = React.Children.toArray(children).join("");

  useEffect(() => {
    let resizeTimer = 0;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => setResizeVersion((value) => value + 1), 120);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId = 0;
    let cancelled = false;
    let hovering = false;
    let currentIntensity = baseIntensity;
    let lastFrameTime = 0;
    let ripplePhase = 0;
    let phaseRate = 1 / 260;
    let rowFrequency = 0.34;
    let columnFrequency = 0.085;
    let rippleX = 0;
    let rippleY = 0;
    const verticalMargin = 6;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initialize = async () => {
      await document.fonts.ready;
      if (cancelled) return;

      const computedFamily =
        fontFamily === "inherit"
          ? window.getComputedStyle(canvas).fontFamily || "sans-serif"
          : fontFamily;
      const computedSize =
        typeof fontSize === "number"
          ? fontSize
          : parseFloat(window.getComputedStyle(canvas).fontSize) || 27;
      const fontSizeValue = `${computedSize}px`;
      const font = `${fontWeight} ${fontSizeValue} ${computedFamily}`;

      const source = document.createElement("canvas");
      const sourceContext = source.getContext("2d");
      const context = canvas.getContext("2d");
      if (!sourceContext || !context) return;

      sourceContext.font = font;
      const metrics = sourceContext.measureText(text);
      const ascent = Math.ceil(metrics.actualBoundingBoxAscent || computedSize);
      const descent = Math.ceil(metrics.actualBoundingBoxDescent || computedSize * 0.24);
      let textWidth = 0;
      if (letterSpacing) {
        for (const character of text) textWidth += sourceContext.measureText(character).width + letterSpacing;
        textWidth -= letterSpacing;
      } else {
        textWidth = metrics.width;
      }

      const sourceWidth = Math.ceil(textWidth) + 10;
      const sourceHeight = ascent + descent + 2;
      source.width = sourceWidth;
      source.height = sourceHeight;
      sourceContext.font = font;
      sourceContext.textBaseline = "alphabetic";

      if (gradient && gradient.length > 1) {
        const fill = sourceContext.createLinearGradient(0, 0, sourceWidth, 0);
        gradient.forEach((value, index) => fill.addColorStop(index / (gradient.length - 1), value));
        sourceContext.fillStyle = fill;
      } else {
        sourceContext.fillStyle = color;
      }

      if (letterSpacing) {
        let x = 5;
        for (const character of text) {
          sourceContext.fillText(character, x, ascent);
          x += sourceContext.measureText(character).width + letterSpacing;
        }
      } else {
        sourceContext.fillText(text, 5, ascent);
      }

      const margin = fuzzRange + 20;
      canvas.width = sourceWidth + margin * 2;
      canvas.height = sourceHeight + verticalMargin * 2;
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
      rippleX = margin + sourceWidth / 2;
      rippleY = sourceHeight / 2;

      const horizontalPass = document.createElement("canvas");
      horizontalPass.width = canvas.width;
      horizontalPass.height = sourceHeight;
      const horizontalContext = horizontalPass.getContext("2d");
      if (!horizontalContext) return;

      const render = (timestamp: number) => {
        if (cancelled) return;
        const frameDuration = 1000 / fps;
        if (timestamp - lastFrameTime < frameDuration) {
          animationFrameId = requestAnimationFrame(render);
          return;
        }
        const elapsed = lastFrameTime ? timestamp - lastFrameTime : frameDuration;
        lastFrameTime = timestamp;
        const target = reducedMotion ? 0 : hovering ? hoverIntensity : baseIntensity;
        const progress = transitionDuration > 0 ? Math.min(1, elapsed / transitionDuration) : 1;
        currentIntensity += (target - currentIntensity) * progress;
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (currentIntensity < 0.004) {
          context.drawImage(source, margin, verticalMargin);
        } else {
          const amplitude = fuzzRange * currentIntensity;
          const targetPhaseRate = hovering ? 1 / 135 : 1 / 260;
          const targetRowFrequency = hovering ? 0.5 : 0.34;
          const targetColumnFrequency = hovering ? 0.13 : 0.085;
          phaseRate += (targetPhaseRate - phaseRate) * progress;
          rowFrequency += (targetRowFrequency - rowFrequency) * progress;
          columnFrequency += (targetColumnFrequency - columnFrequency) * progress;
          ripplePhase += elapsed * phaseRate;
          horizontalContext.clearRect(0, 0, horizontalPass.width, horizontalPass.height);
          for (let row = 0; row < sourceHeight; row += 1) {
            const distance = Math.abs(row - rippleY);
            const envelope = Math.exp(-distance / 22);
            const shiftX = Math.sin(distance * rowFrequency - ripplePhase) * amplitude * 0.34 * envelope;
            horizontalContext.drawImage(source, 0, row, sourceWidth, 1, margin + shiftX, row, sourceWidth, 1);
          }
          for (let column = 0; column < canvas.width; column += 1) {
            const distance = Math.abs(column - rippleX);
            const envelope = Math.exp(-distance / Math.max(90, sourceWidth * 0.62));
            const shiftY = Math.sin(distance * columnFrequency - ripplePhase) * amplitude * 0.28 * envelope;
            context.drawImage(horizontalPass, column, 0, 1, sourceHeight, column, verticalMargin + shiftY, 1, sourceHeight);
          }
        }
        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);
    };

    const updateRippleOrigin = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      rippleX = Math.max(0, Math.min(canvas.width, event.clientX - rect.left));
      rippleY = Math.max(0, Math.min(canvas.height - verticalMargin * 2, event.clientY - rect.top - verticalMargin));
    };
    const enter = (event: PointerEvent) => {
      hovering = true;
      ripplePhase = 0;
      updateRippleOrigin(event);
    };
    const move = (event: PointerEvent) => { updateRippleOrigin(event); };
    const leave = () => { hovering = false; };
    const focus = () => {
      hovering = true;
      ripplePhase = 0;
    };
    if (enableHover) {
      canvas.addEventListener("pointerenter", enter);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerleave", leave);
      canvas.addEventListener("focus", focus);
      canvas.addEventListener("blur", leave);
    }
    initialize();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("pointerenter", enter);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("focus", focus);
      canvas.removeEventListener("blur", leave);
    };
  }, [baseIntensity, color, enableHover, fontFamily, fontSize, fontWeight, fps, fuzzRange, gradient, hoverIntensity, letterSpacing, resizeVersion, text, transitionDuration]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={text}
      tabIndex={0}
    />
  );
}
