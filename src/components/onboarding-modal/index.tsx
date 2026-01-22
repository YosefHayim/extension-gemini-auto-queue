import { SkipForward } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { SpotlightOverlay } from "./SpotlightOverlay";
import { TooltipCard } from "./TooltipCard";
import { tourSteps } from "./tourSteps";

import type { OnboardingModalProps } from "./types";

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  isDark,
  onSwitchTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const step = tourSteps[currentStep];

  const updateTargetPosition = useCallback(() => {
    if (!step?.selector) return;

    const element = document.querySelector(step.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [step?.selector]);

  useEffect(() => {
    setIsTransitioning(true);

    if (step?.tab && onSwitchTab) {
      onSwitchTab(step.tab);
    }

    const timer = setTimeout(() => {
      updateTargetPosition();
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [currentStep, step?.tab, onSwitchTab, updateTargetPosition]);

  useEffect(() => {
    const handleUpdate = () => updateTargetPosition();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div dir="ltr" className="fixed inset-0 z-[2000]">
      <SpotlightOverlay targetRect={targetRect} step={step} onSkip={handleSkip} />

      <button
        onClick={handleSkip}
        className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
      >
        <SkipForward size={14} />
        Skip Tour
      </button>

      <TooltipCard
        step={step}
        currentStep={currentStep}
        totalSteps={tourSteps.length}
        targetRect={targetRect}
        isDark={isDark}
        isTransitioning={isTransitioning}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkip}
      />
    </div>
  );
};

export default OnboardingModal;

export type { OnboardingModalProps } from "./types";
