import { Check, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { SiGoogle } from "react-icons/si";

import { signIn } from "@/backend/services/authService";
import { Button } from "@/extension/components/ui/button";

import type { AuthUser } from "@/backend/types";

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

const FEATURES = [
  "Queue unlimited prompts at once",
  "Auto-download all generated images",
  "Smart retry on errors",
  "Pause, edit & reorder anytime",
  "Bulk translate prompts instantly",
  "Save hours of manual work",
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const result = await signIn();

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setError(result.error ?? "Sign in failed");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <img src="/icons/icon-128.png" alt="PromptQueue" className="h-16 w-16 rounded-[16px]" />
          <h1 className="text-2xl font-bold text-foreground">PromptQueue</h1>
          <p className="text-center text-sm text-muted-foreground">
            Supercharge your Gemini workflow
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          {FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                <Check size={12} className="text-emerald-500" strokeWidth={3} />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button onClick={handleSignIn} disabled={isLoading} className="w-full gap-2" size="lg">
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <SiGoogle size={18} />
                Continue with Google
              </>
            )}
          </Button>

          {error && <p className="text-center text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
