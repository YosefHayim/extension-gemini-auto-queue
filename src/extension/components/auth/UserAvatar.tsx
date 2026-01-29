import { Crown, LogOut } from "lucide-react";
import React, { useState } from "react";

import { getUserInitials, signOut } from "@/backend/services/authService";
import { Avatar, AvatarFallback, AvatarImage } from "@/extension/components/ui/avatar";

import { SubscriptionPlan, type AuthUser } from "@/backend/types";

interface UserAvatarProps {
  user: AuthUser;
  onSignOut: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, onSignOut }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onSignOut();
    setShowMenu(false);
  };

  const isPro = user.plan === SubscriptionPlan.PRO;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-muted"
      >
        <div className="relative">
          <Avatar className="h-8 w-8">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.firstName} />}
            <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          {isPro && (
            <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 shadow-sm">
              <Crown size={10} className="text-white" />
            </div>
          )}
        </div>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full z-[1000] mt-2 w-64 rounded-lg border border-border bg-background p-2 shadow-lg">
            <div className="border-b border-border px-3 py-2">
              <p className="truncate text-sm font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                {isPro ? (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <Crown size={10} />
                    Pro Plan
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Free Plan
                  </span>
                )}
              </div>
            </div>
            {!isPro && (
              <a
                href="https://yosefhayimsabag.com/prompt-queue/checkout/buy/44bdfe85-5961-4caf-911b-9d5a059664ce"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-amber-600 transition-colors hover:bg-amber-500/10 dark:text-amber-400"
              >
                <Crown size={16} />
                Upgrade to Pro
              </a>
            )}
            <button
              onClick={handleSignOut}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserAvatar;
