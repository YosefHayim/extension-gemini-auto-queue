import { Info } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

type TooltipPosition = "top" | "left" | "right" | "bottom";

interface TooltipProps {
  text: string;
  isDark?: boolean;
  position?: TooltipPosition;
  delay?: number;
  size?: number;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  isDark: _isDark,
  position = "top",
  delay = 300,
  size = 10,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState<TooltipPosition>(position);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = position;

    if (position === "top" && trigger.top - tooltip.height < 10) {
      newPosition = "bottom";
    } else if (position === "bottom" && trigger.bottom + tooltip.height > viewportHeight - 10) {
      newPosition = "top";
    } else if (position === "left" && trigger.left - tooltip.width < 10) {
      newPosition = "right";
    } else if (position === "right" && trigger.right + tooltip.width > viewportWidth - 10) {
      newPosition = "left";
    }

    const isNarrowViewport = viewportWidth < 400;
    const isVerticalPosition = position === "top" || position === "bottom";

    if (isVerticalPosition && isNarrowViewport) {
      const tooltipHalfWidth = tooltip.width / 2;
      const triggerCenter = trigger.left + trigger.width / 2;
      const wouldOverflowLeft = triggerCenter - tooltipHalfWidth < 10;
      const wouldOverflowRight = triggerCenter + tooltipHalfWidth > viewportWidth - 10;

      if (wouldOverflowLeft) {
        newPosition = "right";
      } else if (wouldOverflowRight) {
        newPosition = "left";
      }
    }

    if (newPosition !== actualPosition) {
      setActualPosition(newPosition);
    }
  }, [isVisible, position, actualPosition]);

  const getPositionStyles = (): string => {
    const positionMap: Record<TooltipPosition, string> = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };
    return positionMap[actualPosition];
  };

  const getArrowStyles = (): string => {
    const baseArrow = "absolute border-4 border-transparent";
    const arrowColorClass = "border-popover";

    const arrowMap: Record<TooltipPosition, string> = {
      top: `${baseArrow} left-1/2 top-full -translate-x-1/2 ${arrowColorClass.replace("border-", "border-t-")}`,
      bottom: `${baseArrow} left-1/2 bottom-full -translate-x-1/2 ${arrowColorClass.replace("border-", "border-b-")}`,
      left: `${baseArrow} left-full top-1/2 -translate-y-1/2 ${arrowColorClass.replace("border-", "border-l-")}`,
      right: `${baseArrow} right-full top-1/2 -translate-y-1/2 ${arrowColorClass.replace("border-", "border-r-")}`,
    };
    return arrowMap[actualPosition];
  };

  return (
    <span
      ref={triggerRef}
      className="relative ml-1 inline-flex items-center opacity-40 transition-colors duration-150 hover:opacity-70"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children ?? <Info size={size} />}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`bg-popover text-popover-foreground pointer-events-none absolute z-[2147483647] max-h-[200px] w-[200px] overflow-auto whitespace-normal rounded-lg border border-border px-3 py-2 text-[11px] leading-relaxed shadow-xl transition-opacity duration-150 ${getPositionStyles()}`}
        >
          <div className="break-words">{text}</div>
          <div className={getArrowStyles()} />
        </div>
      )}
    </span>
  );
};

export default Tooltip;
