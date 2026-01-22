import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import React from "react";

import type { TourStep } from "./types";

interface TooltipCardProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  isDark: boolean;
  isTransitioning: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const getTooltipStyle = (targetRect: DOMRect | null, step: TourStep): React.CSSProperties => {
  if (!targetRect) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const padding = step.spotlightPadding || 4;
  const tooltipWidth = 320;
  const tooltipHeight = 180;
  const margin = 16;

  let top = 0;
  let left = 0;

  switch (step.position) {
    case "top":
      top = targetRect.top - tooltipHeight - margin;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case "bottom":
      top = targetRect.bottom + margin + padding;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case "left":
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - tooltipWidth - margin;
      break;
    case "right":
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.right + margin + padding;
      break;
    default:
      top = targetRect.bottom + margin;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
  }

  top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));

  return { top, left, width: tooltipWidth };
};

export const TooltipCard: React.FC<TooltipCardProps> = ({
  step,
  currentStep,
  totalSteps,
  targetRect,
  isDark,
  isTransitioning,
  onNext,
  onBack,
  onSkip,
}) => {
  const isLastStep = currentStep >= totalSteps - 1;

  return (
    <div
      className={`absolute z-10 transition-all duration-300 ${isTransitioning ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
      style={getTooltipStyle(targetRect, step)}
    >
      <div
        className={`rounded-xl border p-4 shadow-2xl backdrop-blur-xl ${
          isDark
            ? "border-white/10 bg-gray-900/95 text-white"
            : "border-slate-200 bg-white/95 text-slate-900"
        }`}
      >
        <div className="mb-3 flex items-center gap-3">
          <div
            className={`rounded-lg p-2 ${
              isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
            }`}
          >
            {step.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black">{step.title}</h3>
            <div className="mt-0.5 text-[10px] font-medium opacity-50">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
          <button
            onClick={onSkip}
            className="rounded-md p-1 opacity-40 transition-opacity hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mb-4 text-xs leading-relaxed opacity-80">{step.description}</p>

        <div className="mb-4 flex gap-1">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all ${
                idx <= currentStep ? "bg-blue-500" : isDark ? "bg-white/10" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {currentStep > 0 ? (
            <button
              onClick={onBack}
              className={`flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-[10px] font-bold transition-all ${
                isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              <ChevronLeft size={14} />
              Back
            </button>
          ) : (
            <div className="flex-1" />
          )}

          <button
            onClick={onNext}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500"
          >
            {!isLastStep ? (
              <>
                Next
                <ChevronRight size={14} />
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Get Started
              </>
            )}
          </button>
        </div>
      </div>

      {targetRect && (
        <div
          className={`absolute h-3 w-3 rotate-45 ${isDark ? "bg-gray-900" : "bg-white"}`}
          style={{
            ...(step.position === "top" && {
              bottom: -6,
              left: "50%",
              marginLeft: -6,
            }),
            ...(step.position === "bottom" && {
              top: -6,
              left: "50%",
              marginLeft: -6,
            }),
            ...(step.position === "left" && {
              right: -6,
              top: "50%",
              marginTop: -6,
            }),
            ...(step.position === "right" && {
              left: -6,
              top: "50%",
              marginTop: -6,
            }),
          }}
        />
      )}
    </div>
  );
};
