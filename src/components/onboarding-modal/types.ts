import type React from "react";

export interface OnboardingModalProps {
  onComplete: () => void;
  isDark: boolean;
  onSwitchTab?: (tab: "queue" | "templates" | "settings") => void;
}

export interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  selector: string;
  tab?: "queue" | "templates" | "settings";
  position?: "top" | "bottom" | "left" | "right";
  spotlightPadding?: number;
}
