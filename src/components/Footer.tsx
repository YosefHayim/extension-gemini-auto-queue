import { Heart } from "lucide-react";
import React from "react";

interface FooterProps {
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isDark: _isDark }) => {
  return (
    <footer className="flex flex-col items-center gap-1 border-t border-border bg-gradient-to-t from-muted/50 to-transparent px-3 py-2.5">
      <p className="text-xs text-muted-foreground/60">Nano Flow v1.0.0</p>
      <div className="flex items-center gap-1.5 text-[10px] tracking-wide text-muted-foreground/40">
        <span className="font-light">Made with</span>
        <Heart size={9} className="fill-rose-500/60 text-rose-500/60" />
        <span className="font-light">for Gemini users</span>
      </div>
    </footer>
  );
};

export default Footer;
