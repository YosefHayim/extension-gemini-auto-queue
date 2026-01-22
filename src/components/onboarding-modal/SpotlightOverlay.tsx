import React from "react";

import type { TourStep } from "./types";

interface SpotlightOverlayProps {
  targetRect: DOMRect | null;
  step: TourStep;
  onSkip: () => void;
}

export const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({ targetRect, step, onSkip }) => {
  const getSpotlightStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return { clipPath: "none" };
    }

    const padding = step.spotlightPadding || 4;
    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const w = targetRect.width + padding * 2;
    const h = targetRect.height + padding * 2;
    const r = 8;

    return {
      clipPath: `polygon(
        0% 0%,
        0% 100%,
        ${x}px 100%,
        ${x}px ${y + r}px,
        ${x + r}px ${y}px,
        ${x + w - r}px ${y}px,
        ${x + w}px ${y + r}px,
        ${x + w}px ${y + h - r}px,
        ${x + w - r}px ${y + h}px,
        ${x + r}px ${y + h}px,
        ${x}px ${y + h - r}px,
        ${x}px 100%,
        100% 100%,
        100% 0%
      )`,
    };
  };

  return (
    <>
      <div
        className="absolute inset-0 bg-black/70 transition-all duration-300"
        style={getSpotlightStyle()}
        onClick={onSkip}
      />

      {targetRect && (
        <div
          className="pointer-events-none absolute rounded-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent transition-all duration-300"
          style={{
            top: targetRect.top - (step.spotlightPadding || 4),
            left: targetRect.left - (step.spotlightPadding || 4),
            width: targetRect.width + (step.spotlightPadding || 4) * 2,
            height: targetRect.height + (step.spotlightPadding || 4) * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0), 0 0 30px rgba(59, 130, 246, 0.5)",
          }}
        />
      )}
    </>
  );
};
