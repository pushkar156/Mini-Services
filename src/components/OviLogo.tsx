"use client";

import React from "react";

interface OviLogoProps {
  size?: number;
  className?: string;
}

export const OviLogo: React.FC<OviLogoProps> = ({ size = 26, className = "" }) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none group/logo ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover/logo:scale-105"
      >
        {/* Subtle Outer Frame */}
        <rect
          width="32"
          height="32"
          rx="7"
          className="dark:fill-[#16181D] fill-[#EFECE6] dark:stroke-white/10 stroke-black/10 group-hover/logo:stroke-[#CDC6BB]/60 transition-colors"
          strokeWidth="1"
        />

        {/* Architectural Datum Orbit */}
        <circle
          cx="16"
          cy="16"
          r="10.5"
          className="dark:stroke-[#CDC6BB]/20 stroke-[#7A7E85]/30 group-hover/logo:stroke-[#CDC6BB]/50 transition-colors"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />

        {/* The 'O' Geometric Ring */}
        <circle
          cx="16"
          cy="16"
          r="7"
          className="dark:stroke-[#EDEAE5] stroke-[#18191C] group-hover/logo:stroke-[#C89B6D] transition-colors"
          strokeWidth="1.4"
        />

        {/* The 'V' Vertex Anchor */}
        <path
          d="M10.5 12L16 21L21.5 12"
          className="dark:stroke-[#CDC6BB] stroke-[#4A463F] group-hover/logo:stroke-[#18191C] transition-colors"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The 'I' Datum Plumb Column */}
        <line
          x1="16"
          y1="8"
          x2="16"
          y2="16"
          className="dark:stroke-[#9E988E] stroke-[#6E6A63] transition-colors"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* Atelier Smoked Amber Pip */}
        <circle
          cx="16"
          cy="16"
          r="1.3"
          className="fill-[#C89B6D] shadow-sm"
        />
      </svg>
    </div>
  );
};

export default OviLogo;
