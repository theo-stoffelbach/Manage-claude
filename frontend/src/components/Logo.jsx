import React from 'react';

/**
 * Claude Manager Logo Component
 * Modern, minimalist logo with terminal and AI elements
 */
export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`${sizeClass} ${className} relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FCD34D', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Main background */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="22"
          fill="url(#logoGradient)"
        />

        {/* Terminal window frame */}
        <rect
          x="15"
          y="25"
          width="70"
          height="50"
          rx="6"
          fill="#1F2937"
          opacity="0.9"
        />

        {/* Terminal dots (close, minimize, maximize) */}
        <circle cx="22" cy="32" r="2.5" fill="#EF4444" />
        <circle cx="30" cy="32" r="2.5" fill="#F59E0B" />
        <circle cx="38" cy="32" r="2.5" fill="#10B981" />

        {/* Command prompt symbol ">" */}
        <path
          d="M 23 45 L 30 50 L 23 55"
          stroke="#FBBF24"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* AI spark/star effect */}
        <g opacity="0.9">
          {/* Top right spark */}
          <path
            d="M 75 20 L 76 15 L 77 20 L 82 21 L 77 22 L 76 27 L 75 22 L 70 21 Z"
            fill="url(#sparkGradient)"
          />
          {/* Bottom right small spark */}
          <path
            d="M 82 75 L 82.5 72 L 83 75 L 86 75.5 L 83 76 L 82.5 79 L 82 76 L 79 75.5 Z"
            fill="url(#sparkGradient)"
          />
        </g>

        {/* Cursor blink */}
        <rect
          x="35"
          y="46"
          width="3"
          height="8"
          fill="#FBBF24"
          opacity="0.8"
        >
          <animate
            attributeName="opacity"
            values="0.8;0.2;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    </div>
  );
}
