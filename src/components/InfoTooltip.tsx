import { Info } from "lucide-react";
import React from "react";

interface InfoTooltipProps {
  text: string;
  size?: number;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, size = 10 }) => {
  return (
    <span
      title={text}
      className="ml-1 inline-flex cursor-help items-center opacity-30 transition-opacity hover:opacity-70"
    >
      <Info size={size} />
    </span>
  );
};

export default InfoTooltip;
