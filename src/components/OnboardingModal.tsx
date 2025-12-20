import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  BookMarked,
  Wand2,
  Zap,
  ChevronRight,
  ChevronLeft,
  CheckCircle
} from 'lucide-react';

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
      title: 'Welcome to Nano Flow',
      description:
        "A high-performance bulk image generation engine designed to unlock Gemini's creative potential at scale.",
      icon: <Sparkles className="text-blue-500" size={40} />
    },
    {
      title: 'The Queue Engine',
      description:
        'Paste dozens of prompts or upload a CSV. Use the selection toolbar to weight specific words for the AI.',
      icon: <Cpu className="text-amber-500" size={40} />
    },
    {
      title: 'Style Library',
      description:
        'Manage custom modifiers, instructions, and reference assets in folders. Apply them to your queue in one click.',
      icon: <BookMarked className="text-emerald-500" size={40} />
    },
    {
      title: 'AI Prompt Optimization',
      description:
        'Use the magic wand icons to let Gemini analyze and improve your library prompts automatically for better results.',
      icon: <Wand2 className="text-amber-400" size={40} />
    },
    {
      title: 'Flash vs Pro',
      description:
        'Toggle between ultra-fast Flash 2.0 and high-fidelity Imagen 3 models in your application settings.',
      icon: <Zap className="text-purple-500" size={40} />
    }
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-2">
      <div
        className={`max-w-md w-full p-6 rounded-md border shadow-2xl animate-in fade-in zoom-in-95 duration-300 ${
          isDark ? 'glass-panel border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-white/5 rounded-md shadow-inner border border-white/5 mb-2">
            {steps[step].icon}
          </div>
          <h2 className="text-xl font-black tracking-tight">{steps[step].title}</h2>
          <p className="text-sm opacity-60 leading-relaxed font-medium min-h-[60px]">
            {steps[step].description}
          </p>

          <div className="flex gap-1 mb-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  step === idx ? 'bg-blue-500 w-4' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className="w-full flex gap-2">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 p-2 rounded-md border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft size={14} /> Back
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex-1 p-2 rounded-md border border-white/10 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-all"
              >
                Skip
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-[2] p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex-[2] p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
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

