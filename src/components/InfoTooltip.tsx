import { Info } from "lucide-react";
import React, { useState } from "react";

interface InfoTooltipProps {
  text: string;
  size?: number;
  isDark?: boolean;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, size = 10, isDark = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="relative ml-1 inline-flex items-center opacity-30 transition-opacity hover:opacity-70"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Info size={size} />
      {isHovered && (
        <div
          className={`pointer-events-auto absolute bottom-full left-1/2 z-[2147483647] mb-2 max-h-[200px] w-[200px] -translate-x-1/2 overflow-auto whitespace-normal rounded-md px-3 py-2 text-xs normal-case shadow-xl ${
            isDark ? "border border-white/20 bg-gray-800 text-white" : "bg-gray-900 text-white"
          }`}
        >
          <div className="break-words">{text}</div>
          <div
            className={`absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent ${
              isDark ? "border-t-gray-800" : "border-t-gray-900"
            }`}
          />
        </div>
      )}
    </span>
  );
};

export default InfoTooltip;
