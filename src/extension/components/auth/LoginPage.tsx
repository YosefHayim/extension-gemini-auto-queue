import { Loader2, Zap } from "lucide-react";
import React, { useState } from "react";
import { SiGoogle } from "react-icons/si";

import { Button } from "@/extension/components/ui/button";
import { signIn } from "@/backend/services/authService";

import type { AuthUser } from "@/backend/types";

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

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
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <img src="/icons/icon-128.png" alt="Groove" className="h-20 w-20 rounded-[20px]" />
          <h1 className="text-2xl font-bold text-foreground">Groove</h1>
          <p className="text-center text-sm text-muted-foreground">
            Sign in to supercharge your Gemini workflow
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Zap size={20} className="mt-0.5 shrink-0 text-primary" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">Batch Processing</span>
                <span className="text-xs text-muted-foreground">
                  Queue multiple prompts and run them automatically
                </span>
              </div>
            </div>
          </div>

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

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
