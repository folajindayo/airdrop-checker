"use client";

import { ReactNode, useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipCoords = calculatePosition(rect, position);
        setCoords(tooltipCoords);
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className="pointer-events-none fixed z-50 rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg"
          style={{
            top: coords.top,
            left: coords.left,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

function calculatePosition(
  rect: DOMRect,
  position: "top" | "bottom" | "left" | "right"
): { top: number; left: number } {
  const offset = 8;
  
  switch (position) {
    case "top":
      return {
        top: rect.top - offset,
        left: rect.left + rect.width / 2,
      };
    case "bottom":
      return {
        top: rect.bottom + offset,
        left: rect.left + rect.width / 2,
      };
    case "left":
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - offset,
      };
    case "right":
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + offset,
      };
  }
}
