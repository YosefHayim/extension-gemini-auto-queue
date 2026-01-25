import { ArrowRight, Image, Layers, Rocket, Sparkles, Timer } from "lucide-react";
import React from "react";

import type { OnboardingModalProps } from "@/extension/components/onboarding-modal/types";

const STARTER_PROMPT =
  "A futuristic chrome extension icon with a lightning bolt, minimalist design, gradient purple and blue background, 3D render";

const FEATURES = [
  {
    icon: Layers,
    iconColor: "#2563EB",
    bgColor: "#DBEAFE",
    title: "Batch Processing",
    description: "Queue multiple prompts and run them automatically",
  },
  {
    icon: Timer,
    iconColor: "#059669",
    bgColor: "#D1FAE5",
    title: "Save Hours of Time",
    description: "No more manual copy-paste for each prompt",
  },
  {
    icon: Sparkles,
    iconColor: "#D97706",
    bgColor: "#FEF3C7",
    title: "Smart Automation",
    description: "Auto-download results, retry on errors, and more",
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onUsePrompt }) => {
  const handleUsePrompt = () => {
    onUsePrompt?.(STARTER_PROMPT);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex h-[640px] w-[380px] flex-col border border-border bg-background">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
          <div className="flex flex-col items-center gap-4">
            <img src="/icons/icon-128.png" alt="Groove" className="h-20 w-20 rounded-[20px]" />
            <h1 className="text-[28px] font-bold text-foreground">Groove</h1>
            <p className="text-center text-[15px] text-muted-foreground">
              Supercharge your Gemini workflow
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon size={18} style={{ color: feature.iconColor }} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">{feature.title}</span>
                  <span className="text-[13px] text-muted-foreground">{feature.description}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3">
            <span className="text-[13px] font-semibold text-foreground">Try your first prompt</span>
            <div className="flex flex-col gap-2.5 rounded-md border border-border bg-muted p-3">
              <p className="text-[13px] leading-relaxed text-foreground">{STARTER_PROMPT}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
                  <Image size={12} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Image</span>
                </span>
                <button
                  onClick={handleUsePrompt}
                  className="flex items-center gap-1.5 rounded bg-primary px-3 py-1.5"
                >
                  <ArrowRight size={14} className="text-primary-foreground" />
                  <span className="text-xs font-semibold text-primary-foreground">
                    Use this prompt
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-3">
            <button
              onClick={onComplete}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3.5"
            >
              <Rocket size={18} className="text-primary-foreground" />
              <span className="text-[15px] font-semibold text-primary-foreground">Get Started</span>
            </button>
            <button
              onClick={onComplete}
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

export type { OnboardingModalProps } from "@/extension/components/onboarding-modal/types";
