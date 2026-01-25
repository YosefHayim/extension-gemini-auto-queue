import { Heart } from "lucide-react";
import React from "react";

interface FooterProps {
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isDark }) => {
  return (
    <footer
      className={`flex flex-col items-center gap-1 border-t px-3 py-2.5 ${
        isDark
          ? "border-white/[0.06] bg-gradient-to-t from-black/20 to-transparent"
          : "border-black/[0.06] bg-gradient-to-t from-gray-100/50 to-transparent"
      }`}
    >
      <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>Nano Flow v1.0.0</p>
      <div
        className={`flex items-center gap-1.5 text-[10px] tracking-wide ${
          isDark ? "text-white/25" : "text-gray-400/70"
        }`}
      >
        <span className="font-light">Made with</span>
        <Heart
          size={9}
          className={
            isDark ? "fill-rose-500/60 text-rose-500/60" : "fill-rose-400/70 text-rose-400/70"
          }
        />
        <span className="font-light">for Gemini users</span>
      </div>
    </footer>
  );
};

export default Footer;
