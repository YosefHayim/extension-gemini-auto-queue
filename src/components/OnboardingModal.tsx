import {
  BookMarked,
  Brain,
  Camera,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Download,
  GripVertical,
  Layers,
  Play,
  SkipForward,
  Sparkles,
  Type,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface OnboardingModalProps {
  onComplete: () => void;
  isDark: boolean;
  onSwitchTab?: (tab: "queue" | "templates" | "settings") => void;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  selector: string; // CSS selector to highlight
  tab?: "queue" | "templates" | "settings";
  position?: "top" | "bottom" | "left" | "right";
  spotlightPadding?: number;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  isDark,
  onSwitchTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const steps: TourStep[] = [
    {
      id: "welcome",
      title: "Welcome to Nano Flow",
      description: "Your batch processing powerhouse for Gemini. Let's take a quick tour!",
      icon: <Sparkles className="h-5 w-5" />,
      selector: "[data-onboarding='sidebar-header']",
      tab: "queue",
      position: "bottom",
    },
    {
      id: "textarea",
      title: "Add Your Prompts",
      description:
        "Enter multiple prompts here, one per paragraph. Press Ctrl+Enter to add them to the queue.",
      icon: <Type className="h-5 w-5" />,
      selector: "[data-onboarding='queue-textarea']",
      tab: "queue",
      position: "top",
      spotlightPadding: 8,
    },
    {
      id: "tool-selector",
      title: "Choose Your Tool",
      description:
        "Select Image, Video, Canvas, or other tools. Each prompt can use a different tool.",
      icon: <Camera className="h-5 w-5" />,
      selector: "[data-onboarding='tool-selector']",
      tab: "queue",
      position: "top",
    },
    {
      id: "add-queue",
      title: "Build Your Queue",
      description:
        "Click here to add prompts to the queue. Import CSV for bulk uploads with images.",
      icon: <Layers className="h-5 w-5" />,
      selector: "[data-onboarding='add-queue-btn']",
      tab: "queue",
      position: "top",
    },
    {
      id: "start-engine",
      title: "Start Processing",
      description:
        "Hit this button to start batch processing. Watch as prompts are generated automatically!",
      icon: <Play className="h-5 w-5" />,
      selector: "[data-onboarding='start-button']",
      tab: "queue",
      position: "top",
    },
    {
      id: "queue-list",
      title: "Monitor Progress",
      description:
        "Your queue items appear here. Drag to reorder, edit, duplicate, or remove items.",
      icon: <Cpu className="h-5 w-5" />,
      selector: "[data-onboarding='queue-list']",
      tab: "queue",
      position: "top",
      spotlightPadding: 8,
    },
    {
      id: "drag-reorder",
      title: "Drag to Reorder",
      description:
        "Grab the handle on any item to drag and drop it into a new position in your queue.",
      icon: <GripVertical className="h-5 w-5" />,
      selector: "[data-onboarding='queue-list']",
      tab: "queue",
      position: "top",
    },
    {
      id: "export-queue",
      title: "Export Your Work",
      description:
        "Download your queue as TXT, JSON, or CSV. Great for backing up or sharing prompts.",
      icon: <Download className="h-5 w-5" />,
      selector: "[data-onboarding='start-button']",
      tab: "queue",
      position: "top",
    },
    {
      id: "templates",
      title: "Save Your Favorites",
      description: "Organize prompts into folders. Reuse templates and reference images instantly.",
      icon: <BookMarked className="h-5 w-5" />,
      selector: "[data-onboarding='templates-panel']",
      tab: "templates",
      position: "right",
      spotlightPadding: 8,
    },
    {
      id: "ai-optimize",
      title: "AI Enhancement",
      description:
        "Click the wand icon on any template to let AI improve your prompts automatically.",
      icon: <Wand2 className="h-5 w-5" />,
      selector: "[data-onboarding='templates-panel']",
      tab: "templates",
      position: "right",
    },
    {
      id: "tool-selector",
      title: "Choose Your Tool",
      description:
        "Select Image, Video, Canvas, or other tools. Each prompt can use a different tool.",
      icon: <Camera className="h-5 w-5" />,
      selector: "[data-onboarding='tool-selector']",
      tab: "queue",
      position: "top",
    },
    {
      id: "mode-selector",
      title: "Select Response Mode",
      description:
        "Choose Quick for speed, Deep for thorough thinking, or Pro for highest quality output.",
      icon: <Brain className="h-5 w-5" />,
      selector: "[data-onboarding='mode-selector']",
      tab: "queue",
      position: "top",
    },
    {
      id: "model-selector",
      title: "Choose Your Model",
      description: "Flash 2.0 for speed, Imagen 3 for quality. Pick what suits your needs.",
      icon: <Zap className="h-5 w-5" />,
      selector: "[data-onboarding='model-selector']",
      tab: "settings",
      position: "top",
    },
    {
      id: "theme-system",
      title: "Auto Theme Sync",
      description:
        "Choose System theme to automatically match your browser's light/dark preference.",
      icon: <Sparkles className="h-5 w-5" />,
      selector: "[data-onboarding='theme-selector']",
      tab: "settings",
      position: "top",
    },
  ];

  const step = steps[currentStep];

  // Find and track the target element
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

  // Switch tab and update position when step changes
  useEffect(() => {
    setIsTransitioning(true);

    if (step?.tab && onSwitchTab) {
      onSwitchTab(step.tab);
    }

    // Wait for tab switch animation then find element
    const timer = setTimeout(() => {
      updateTargetPosition();
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [currentStep, step?.tab, onSwitchTab, updateTargetPosition]);

  // Update position on resize/scroll
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
    if (currentStep < steps.length - 1) {
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

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
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

    // Keep within viewport
    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));

    return { top, left, width: tooltipWidth };
  };

  // Calculate spotlight clip path
  const getSpotlightStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return { clipPath: "none" };
    }

    const padding = step.spotlightPadding || 4;
    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const w = targetRect.width + padding * 2;
    const h = targetRect.height + padding * 2;
    const r = 8; // border radius

    // Create a clip path that excludes the spotlight area
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
    <div dir="ltr" className="fixed inset-0 z-[2000]">
      {/* Dark overlay with spotlight cutout */}
      <div
        className="absolute inset-0 bg-black/70 transition-all duration-300"
        style={getSpotlightStyle()}
        onClick={handleSkip}
      />

      {/* Spotlight border/glow effect */}
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

      {/* Skip button - always visible */}
      <button
        onClick={handleSkip}
        className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
      >
        <SkipForward size={14} />
        Skip Tour
      </button>

      {/* Tooltip/Card */}
      <div
        className={`absolute z-10 transition-all duration-300 ${isTransitioning ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
        style={getTooltipStyle()}
      >
        <div
          className={`rounded-xl border p-4 shadow-2xl backdrop-blur-xl ${
            isDark
              ? "border-white/10 bg-gray-900/95 text-white"
              : "border-slate-200 bg-white/95 text-slate-900"
          }`}
        >
          {/* Header */}
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
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="rounded-md p-1 opacity-40 transition-opacity hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description */}
          <p className="mb-4 text-xs leading-relaxed opacity-80">{step.description}</p>

          {/* Progress bar */}
          <div className="mb-4 flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all ${
                  idx <= currentStep ? "bg-blue-500" : isDark ? "bg-white/10" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            {currentStep > 0 ? (
              <button
                onClick={handleBack}
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
              onClick={handleNext}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500"
            >
              {currentStep < steps.length - 1 ? (
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

        {/* Arrow pointer */}
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
    </div>
  );
};

export default OnboardingModal;
