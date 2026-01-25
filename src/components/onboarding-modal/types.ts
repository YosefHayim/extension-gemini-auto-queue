export interface OnboardingModalProps {
  onComplete: () => void;
  isDark: boolean;
  onSwitchTab?: (tab: "queue" | "templates" | "settings") => void;
  onUsePrompt?: (prompt: string) => void;
}
