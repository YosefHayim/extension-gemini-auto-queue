import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/extension/components/ui/dialog";
import React, { useEffect } from "react";

import type { AuthUser } from "@/backend/types";
import { Button } from "@/extension/components/ui/button";
import { CheckCircle } from "lucide-react";

interface AuthSuccessDialogProps {
  isOpen: boolean;
  user: AuthUser;
  onClose: () => void;
}

export const AuthSuccessDialog: React.FC<AuthSuccessDialogProps> = ({ isOpen, user, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <DialogTitle>Welcome, {user.firstName}!</DialogTitle>
          <DialogDescription>
            You&apos;ve successfully signed in to Nano Flow. You can now start using all features.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-2">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthSuccessDialog;
