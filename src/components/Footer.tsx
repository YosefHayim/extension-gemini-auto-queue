import { Coffee, Github, Heart, Linkedin } from "lucide-react";
import React from "react";

interface FooterProps {
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isDark }) => {
  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/yosefhayimsabag/nano-flow",
      label: "View source on GitHub",
      hoverClass: isDark
        ? "hover:text-white hover:bg-white/10"
        : "hover:text-gray-900 hover:bg-gray-900/10",
    },
    {
      icon: Linkedin,
      href: "https://linkedin.com/in/yosefhayimsabag",
      label: "Connect on LinkedIn",
      hoverClass: isDark
        ? "hover:text-sky-400 hover:bg-sky-400/10"
        : "hover:text-sky-600 hover:bg-sky-600/10",
    },
    {
      icon: Coffee,
      href: "https://buymeacoffee.com/yosefhayim",
      label: "Buy me a coffee",
      hoverClass: isDark
        ? "hover:text-amber-400 hover:bg-amber-400/10"
        : "hover:text-amber-600 hover:bg-amber-600/10",
    },
  ];

  return (
    <footer
      className={`flex flex-col items-center gap-2 border-t px-3 py-2.5 ${
        isDark
          ? "border-white/[0.06] bg-gradient-to-t from-black/20 to-transparent"
          : "border-black/[0.06] bg-gradient-to-t from-gray-100/50 to-transparent"
      }`}
    >
      <div className="flex items-center gap-1">
        {socialLinks.map(({ icon: Icon, href, label, hoverClass }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            aria-label={label}
            className={`group flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 ${
              isDark ? "text-white/40" : "text-gray-400"
            } ${hoverClass}`}
          >
            <Icon
              size={14}
              strokeWidth={1.75}
              className="transition-transform duration-200 group-hover:scale-110"
            />
          </a>
        ))}
      </div>

      <div
        className={`flex items-center gap-1.5 text-[10px] tracking-wide ${
          isDark ? "text-white/25" : "text-gray-400/70"
        }`}
      >
        <span className="font-light">Made with</span>
        <Heart
          size={9}
          className={`${
            isDark ? "fill-rose-500/60 text-rose-500/60" : "fill-rose-400/70 text-rose-400/70"
          }`}
        />
        <span className="font-light">by Yosef Hayim Sabag</span>
      </div>
    </footer>
  );
};

export default Footer;
