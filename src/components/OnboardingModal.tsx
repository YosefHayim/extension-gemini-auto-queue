import {
  BookMarked,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  FileText,
  Layers,
  Play,
  Settings as SettingsIcon,
  Sparkles,
  Type,
  Wand2,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface OnboardingModalProps {
  onComplete: () => void;
  isDark: boolean;
  onHighlight?: (selector: string | null) => void;
  onSwitchTab?: (tab: "queue" | "templates" | "settings") => void;
  onAddDemoPrompts?: () => Promise<void>;
  onStartDemoQueue?: () => Promise<void>;
}

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  whenToUse?: string;
  howToUse?: string;
  example?: string;
  features?: string[];
  highlightSelector?: string;
  switchToTab?: "queue" | "templates" | "settings";
  action?: () => void | Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  isDark,
  onHighlight,
  onSwitchTab,
  onAddDemoPrompts,
  onStartDemoQueue,
}) => {
  const [step, setStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to Gemini Nano Flow",
      description:
        "Transform your Gemini workflow into a high-performance bulk image generation engine. Process dozens of prompts automatically with advanced features.",
      icon: <Sparkles className="text-blue-500" size={40} />,
      whenToUse:
        "Perfect for content creators, designers, and marketers who need to generate multiple images efficiently.",
      howToUse:
        "1. Configure your API key in Settings\n2. Navigate to gemini.google.com or aistudio.google.com\n3. Open the side panel to start queuing prompts",
      example:
        "Generate 50 product images, create a style library for your brand, or batch process variations of a concept.",
    },
    {
      title: "Queue Engine - Batch Processing",
      description:
        "Add multiple prompts at once and process them automatically. Support for text, CSV imports, and reference images.",
      icon: <Cpu className="text-amber-500" size={40} />,
      whenToUse:
        "When you need to generate many images quickly. Great for product catalogs, social media content, or A/B testing variations.",
      howToUse:
        "• Enter prompts: one per line, comma-separated, or numbered list\n• Click 'Add to Queue' to add them\n• Click 'Ignite Engine' to start processing\n• Use CSV import for bulk uploads",
      example:
        "Prompt 1: A cyberpunk cityscape at night\nPrompt 2: A serene mountain landscape\nPrompt 3: A futuristic spaceship interior",
      features: [
        "Multi-format input (lines, commas, lists)",
        "CSV bulk import",
        "Reference image attachments",
        "Automatic queue management",
      ],
      highlightSelector: "[data-onboarding='queue-textarea']",
      switchToTab: "queue",
    },
    {
      title: "Text Selection & Weighting",
      description:
        "Select specific words in your prompt and apply emphasis weights to guide the AI's focus. Perfect for fine-tuning results.",
      icon: <Type className="text-purple-500" size={40} />,
      whenToUse:
        "When you want to emphasize certain elements (e.g., 'vibrant colors', 'detailed textures', 'soft lighting').",
      howToUse:
        "1. Type your prompt in the text area\n2. Select the words you want to emphasize\n3. Choose weight level: Standard (1.2x), Heavy (1.5x), or Echo (repeat)\n4. The weighted text is automatically formatted",
      example:
        "Select 'vibrant colors' → Apply Heavy → Becomes: ((vibrant colors:1.5))\nThis tells the AI to prioritize vibrant colors in the generation.",
      features: [
        "Visual selection toolbar",
        "Three weight levels",
        "Real-time formatting",
        "Works with any prompt",
      ],
      highlightSelector: "[data-onboarding='queue-textarea']",
      switchToTab: "queue",
    },
    {
      title: "Style Library - Organize Templates",
      description:
        "Create folders to organize your favorite prompts, modifiers, and reference images. Reuse them instantly across projects.",
      icon: <BookMarked className="text-emerald-500" size={40} />,
      whenToUse:
        "For recurring styles, brand guidelines, or prompt patterns you use frequently. Build a library of your best prompts.",
      howToUse:
        "1. Go to 'Collections' tab\n2. Create folders (e.g., 'Product Shots', 'Art Styles')\n3. Add templates with prompts and reference images\n4. Click the + button to add templates to queue instantly",
      example:
        "Folder: 'Product Photography'\nTemplate: 'Studio lighting, white background, professional product shot'\nWith reference images of your product style",
      features: [
        "Folder organization",
        "Template reuse",
        "Reference image storage",
        "One-click queue addition",
      ],
      highlightSelector: "[data-onboarding='templates-panel']",
      switchToTab: "templates",
    },
    {
      title: "AI Prompt Optimization",
      description:
        "Let AI analyze and improve your prompts automatically. Get better results by enhancing clarity, detail, and effectiveness.",
      icon: <Wand2 className="text-amber-400" size={40} />,
      whenToUse:
        "When your prompts aren't producing the desired results, or you want to enhance existing templates for better quality.",
      howToUse:
        "1. Configure an AI API key in Settings (Gemini, OpenAI, or Anthropic)\n2. Click the ✨ wand icon on any template\n3. AI analyzes and improves the prompt\n4. Review and save the enhanced version",
      example:
        "Before: 'A beautiful landscape'\nAfter: 'A breathtaking landscape with dramatic lighting, rich colors, and cinematic composition, showcasing natural beauty in high detail'",
      features: [
        "One-click optimization",
        "Template and folder-level",
        "Multiple AI provider support",
        "Preserves your intent",
      ],
      highlightSelector: "[data-onboarding='templates-panel']",
      switchToTab: "templates",
    },
    {
      title: "Multi-Tool Support",
      description:
        "Generate images, videos, canvas layouts, and more. Choose the right tool for each prompt or cycle through them automatically.",
      icon: <Layers className="text-indigo-500" size={40} />,
      whenToUse:
        "Different content types need different tools. Images for visuals, Video for motion, Canvas for layouts, Research for analysis.",
      howToUse:
        "• Select tool before adding to queue (Image, Video, Canvas, etc.)\n• Or enable 'Tool Sequence' in Settings to cycle automatically\n• Each prompt can use a different tool",
      example:
        "Prompt 1: Use Image tool for 'A sunset landscape'\nPrompt 2: Use Video tool for 'A time-lapse of clouds'\nPrompt 3: Use Canvas tool for 'A website layout design'",
      features: [
        "Image generation",
        "Video creation",
        "Canvas layouts",
        "Research tools",
        "Automatic tool cycling",
      ],
      highlightSelector: "[data-onboarding='tool-selector']",
      switchToTab: "queue",
    },
    {
      title: "Model Selection - Speed vs Quality",
      description:
        "Choose between Flash 2.0 for speed or Imagen 3 for maximum quality. Perfect for different use cases.",
      icon: <Zap className="text-purple-500" size={40} />,
      whenToUse:
        "Flash 2.0: Quick iterations, testing ideas, bulk generation\nImagen 3: Final assets, high-quality outputs, professional work",
      howToUse:
        "1. Go to Settings tab\n2. Select 'Active Synthesis Model'\n3. Choose Flash 2.0 (High Speed) or Imagen 3 (High Fidelity)\n4. Your choice applies to all queue items",
      example:
        "Use Flash 2.0 to generate 100 variations quickly, then switch to Imagen 3 for the final 10 selected images.",
      features: [
        "Flash 2.0: Ultra-fast generation",
        "Imagen 3: Maximum quality",
        "Easy switching",
        "Applies to entire queue",
      ],
      highlightSelector: "[data-onboarding='model-selector']",
      switchToTab: "settings",
    },
    {
      title: "Advanced Features",
      description:
        "Global prefixes/suffixes, negative prompts, drip feed mode, and more. Fine-tune every aspect of your generation workflow.",
      icon: <SettingsIcon className="text-blue-500" size={40} />,
      whenToUse:
        "For professional workflows requiring consistency, quality control, and rate limit management.",
      howToUse:
        "Settings include:\n• Global Prefix/Suffix: Auto-add text to all prompts\n• Negative Prompts: Avoid unwanted elements\n• Drip Feed: Random delays to prevent rate limiting\n• Sidebar Position: Left or right side\n• Theme: Dark or light mode",
      example:
        "Prefix: 'High quality, detailed'\nSuffix: '4K resolution, cinematic'\nNegatives: 'blurry, watermark, text'\nResult: All prompts automatically include these modifiers",
      features: [
        "Global modifiers",
        "Negative prompts",
        "Rate limit protection",
        "Customizable UI",
        "Theme options",
      ],
      highlightSelector: "[data-onboarding='settings-panel']",
      switchToTab: "settings",
    },
    {
      title: "Complete Workflow - Live Demo",
      description:
        "Let's run a complete example! We'll add demo prompts to the queue and watch them process automatically.",
      icon: <Play className="text-emerald-500" size={40} />,
      whenToUse: "Follow this flow for your first successful batch generation.",
      howToUse:
        "1. ⚙️ Settings: Add your Gemini API key\n2. 📝 Queue: Add prompts (one per line or CSV)\n3. 🎨 Optional: Select words and apply weights\n4. 📸 Optional: Attach reference images\n5. 🚀 Click 'Ignite Engine' to start\n6. ⏸️ Monitor progress in the queue\n7. 💾 Download images as they complete",
      example:
        "Step-by-step:\n1. Configure API key → Settings tab\n2. Add 5 prompts to queue → Queue tab\n3. Click 'Ignite Engine' → Processing starts\n4. Watch queue items complete → Status updates\n5. Download results → Individual or batch",
      features: [
        "End-to-end workflow",
        "Real-time progress",
        "Error handling",
        "Retry failed items",
        "Batch downloads",
      ],
      highlightSelector: "[data-onboarding='start-button']",
      switchToTab: "queue",
      action: async () => {
        // Add demo prompts
        if (onAddDemoPrompts) {
          await onAddDemoPrompts();
        }
        // Wait a moment for UI to update
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Start the queue
        if (onStartDemoQueue) {
          await onStartDemoQueue();
        }
      },
    },
  ];

  const currentStep = steps[step];

  // Handle highlighting and tab switching when step changes
  useEffect(() => {
    if (currentStep.highlightSelector && onHighlight) {
      onHighlight(currentStep.highlightSelector);
    } else if (onHighlight) {
      onHighlight(null);
    }

    if (currentStep.switchToTab && onSwitchTab) {
      onSwitchTab(currentStep.switchToTab);
    }
  }, [step, currentStep, onHighlight, onSwitchTab]);

  // Handle action on step
  useEffect(() => {
    if (currentStep.action && step === steps.length - 1) {
      // Only run action on the last step (demo)
      const actionResult = currentStep.action();
      if (actionResult instanceof Promise) {
        actionResult.catch(console.error);
      }
    }
  }, [step, currentStep, steps.length]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  return (
    <>
      {/* Highlight Overlay */}
      {currentStep.highlightSelector && (
        <div
          className="pointer-events-none fixed inset-0 z-[1999] animate-pulse"
          style={{
            background: `radial-gradient(circle 300px at var(--highlight-x, 50%) var(--highlight-y, 50%), transparent 0%, rgba(0, 0, 0, 0.7) 100%)`,
          }}
        />
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
        <div
          className={`animate-in fade-in zoom-in-95 w-full max-w-2xl rounded-md border p-6 shadow-2xl duration-300 ${
            isDark ? "glass-panel border-white/10" : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col gap-4">
            {/* Header with Icon and Title */}
            <div className="flex items-center gap-4">
              <div className="rounded-md border border-white/5 bg-white/5 p-3 shadow-inner">
                {currentStep.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black tracking-tight">{currentStep.title}</h2>
                <p className="mt-1 text-sm font-medium leading-relaxed opacity-60">
                  {currentStep.description}
                </p>
              </div>
            </div>

            {/* Content Sections */}
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {currentStep.whenToUse && (
                <div
                  className={`rounded-md border p-3 ${
                    isDark ? "border-blue-500/20 bg-blue-500/5" : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-blue-500">
                      When to Use
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{currentStep.whenToUse}</p>
                </div>
              )}

              {currentStep.howToUse && (
                <div
                  className={`rounded-md border p-3 ${
                    isDark
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Play className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                      How to Use
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed opacity-90">
                    {currentStep.howToUse}
                  </pre>
                </div>
              )}

              {currentStep.example && (
                <div
                  className={`rounded-md border p-3 ${
                    isDark
                      ? "border-purple-500/20 bg-purple-500/5"
                      : "border-purple-200 bg-purple-50"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-purple-500">
                      Example
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed opacity-90">
                    {currentStep.example}
                  </pre>
                </div>
              )}

              {currentStep.features && currentStep.features.length > 0 && (
                <div
                  className={`rounded-md border p-3 ${
                    isDark ? "border-amber-500/20 bg-amber-500/5" : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                      Key Features
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {currentStep.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs opacity-90">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Progress Indicators */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === idx ? "w-8 bg-blue-500" : "w-1.5 bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider opacity-40">
                {step + 1} / {steps.length}
              </span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex w-full gap-2">
              {step > 0 ? (
                <button
                  onClick={handleBack}
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
                  onClick={handleNext}
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
    </>
  );
};

export default OnboardingModal;
