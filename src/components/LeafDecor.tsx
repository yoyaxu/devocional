"use client";

import React from "react";

// Decorative botanical leaf component for spiritual/nature feel
export function LeafCorner({ className = "", position = "top-right" }: { className?: string; position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" }) {
  const rotations: Record<string, string> = {
    "top-right": "",
    "top-left": "scale-x-[-1]",
    "bottom-right": "scale-y-[-1]",
    "bottom-left": "scale-x-[-1] scale-y-[-1]",
  };
  const positions: Record<string, string> = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  return (
    <div className={`absolute ${positions[position]} ${rotations[position]} pointer-events-none overflow-hidden ${className}`}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.12] dark:opacity-[0.08]">
        {/* Main leaf */}
        <path d="M95 10 C75 15, 45 35, 30 65 C20 85, 25 105, 40 110 C55 115, 75 100, 90 75 C100 55, 105 25, 95 10Z" fill="#5B7C5A" />
        {/* Leaf vein */}
        <path d="M90 18 C70 40, 50 65, 42 100" stroke="#3D5A3C" strokeWidth="0.8" fill="none" />
        {/* Side veins */}
        <path d="M82 30 C75 38, 68 45, 60 52" stroke="#3D5A3C" strokeWidth="0.4" fill="none" />
        <path d="M72 48 C65 52, 58 56, 50 60" stroke="#3D5A3C" strokeWidth="0.4" fill="none" />
        <path d="M62 65 C57 68, 52 72, 46 76" stroke="#3D5A3C" strokeWidth="0.4" fill="none" />
        {/* Secondary small leaf */}
        <path d="M110 45 C100 48, 85 60, 78 78 C73 90, 80 100, 90 98 C100 96, 110 82, 112 65 C114 55, 112 48, 110 45Z" fill="#5B7C5A" opacity="0.5" />
        {/* Small accent leaf */}
        <path d="M70 5 C62 10, 52 22, 48 38 C45 48, 52 55, 60 50 C68 45, 74 32, 73 18 C72 10, 70 5, 70 5Z" fill="#5B7C5A" opacity="0.35" />
      </svg>
    </div>
  );
}

// Divider with leaf ornament
export function LeafDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-2 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/20" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary/30 dark:text-primary/20">
        <path d="M10 2 C8 5, 5 8, 4 12 C3 15, 6 17, 8 16 C10 15, 12 12, 13 9 C14 6, 12 3, 10 2Z" fill="currentColor" />
        <path d="M10 4 C9 7, 7 10, 6 13" stroke="currentColor" strokeWidth="0.4" fill="none" />
      </svg>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary/20 dark:text-primary/15">
        <path d="M10 2 C8 5, 5 8, 4 12 C3 15, 6 17, 8 16 C10 15, 12 12, 13 9 C14 6, 12 3, 10 2Z" fill="currentColor" />
      </svg>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary/30 dark:text-primary/20">
        <path d="M10 2 C8 5, 5 8, 4 12 C3 15, 6 17, 8 16 C10 15, 12 12, 13 9 C14 6, 12 3, 10 2Z" fill="currentColor" />
        <path d="M10 4 C9 7, 7 10, 6 13" stroke="currentColor" strokeWidth="0.4" fill="none" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/20" />
    </div>
  );
}

// Floating leaf accent for backgrounds
export function FloatingLeaves({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`}>
      <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.06] dark:opacity-[0.04]">
        <path d="M30 50 C20 35, 25 15, 40 8 C55 1, 65 12, 60 28 C55 42, 40 55, 30 50Z" fill="#5B7C5A" />
        <path d="M90 55 C80 45, 78 25, 90 15 C102 5, 118 15, 115 32 C112 48, 98 58, 90 55Z" fill="#5B7C5A" />
        <path d="M160 50 C150 38, 148 20, 162 10 C176 0, 190 10, 186 28 C182 44, 168 54, 160 50Z" fill="#5B7C5A" />
        <path d="M230 55 C222 42, 220 22, 234 12 C248 2, 262 14, 258 30 C254 46, 240 58, 230 55Z" fill="#5B7C5A" />
        <path d="M305 50 C295 38, 293 20, 307 10 C321 0, 335 10, 331 28 C327 44, 313 54, 305 50Z" fill="#5B7C5A" />
        <path d="M370 55 C362 45, 360 28, 372 18 C384 8, 398 20, 394 35 C390 48, 378 58, 370 55Z" fill="#5B7C5A" />
      </svg>
    </div>
  );
}
