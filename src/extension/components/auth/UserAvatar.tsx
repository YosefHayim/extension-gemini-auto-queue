import { LogOut } from "lucide-react";
import React, { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/extension/components/ui/avatar";
import { getUserInitials, signOut } from "@/backend/services/authService";

import type { AuthUser } from "@/backend/types";

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

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-muted"
      >
        <Avatar className="h-8 w-8">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.firstName} />}
          <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
            {getUserInitials(user)}
          </AvatarFallback>
        </Avatar>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="bg-popover absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border p-2 shadow-lg">
            <div className="border-b border-border px-3 py-2">
              <p className="truncate text-sm font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
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
