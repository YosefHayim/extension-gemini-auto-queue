import {
  Sparkles,
  Cpu,
  BookMarked,
  Wand2,
  Zap,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";
import React, { useState } from "react";

interface OnboardingModalProps {
  onComplete: () => void;
  isDark: boolean;
}

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, isDark }) => {
  const [step, setStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to Nano Flow",
      description:
        "A high-performance bulk image generation engine designed to unlock Gemini's creative potential at scale.",
      icon: <Sparkles className="text-blue-500" size={40} />,
    },
    {
      title: "The Queue Engine",
      description:
        "Paste dozens of prompts or upload a CSV. Use the selection toolbar to weight specific words for the AI.",
      icon: <Cpu className="text-amber-500" size={40} />,
    },
    {
      title: "Style Library",
      description:
        "Manage custom modifiers, instructions, and reference assets in folders. Apply them to your queue in one click.",
      icon: <BookMarked className="text-emerald-500" size={40} />,
    },
    {
      title: "AI Prompt Optimization",
      description:
        "Use the magic wand icons to let Gemini analyze and improve your library prompts automatically for better results.",
      icon: <Wand2 className="text-amber-400" size={40} />,
    },
    {
      title: "Flash vs Pro",
      description:
        "Toggle between ultra-fast Flash 2.0 and high-fidelity Imagen 3 models in your application settings.",
      icon: <Zap className="text-purple-500" size={40} />,
    },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
      <div
        className={`animate-in fade-in zoom-in-95 w-full max-w-md rounded-md border p-6 shadow-2xl duration-300 ${
          isDark ? "glass-panel border-white/10" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="mb-2 rounded-md border border-white/5 bg-white/5 p-3 shadow-inner">
            {steps[step].icon}
          </div>
          <h2 className="text-xl font-black tracking-tight">{steps[step].title}</h2>
          <p className="min-h-[60px] text-sm font-medium leading-relaxed opacity-60">
            {steps[step].description}
          </p>

          <div className="mb-4 flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  step === idx ? "w-4 bg-blue-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          <div className="flex w-full gap-2">
            {step > 0 ? (
              <button
                onClick={() => {
                  setStep((s) => s - 1);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 p-2 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5"
              >
                <ChevronLeft size={14} /> Back
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex-1 rounded-md border border-white/10 p-2 text-[10px] font-black uppercase opacity-40 transition-all hover:opacity-100"
              >
                Skip
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => {
                  setStep((s) => s + 1);
                }}
                className="flex flex-[2] items-center justify-center gap-2 rounded-md bg-blue-600 p-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex flex-[2] items-center justify-center gap-2 rounded-md bg-emerald-600 p-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
              >
                Get Started <CheckCircle size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
