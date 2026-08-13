import React from "react";

export default function SkeletonLoader({ className = "h-48 w-full rounded-2xl" }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-[length:200%_100%] ${className}`}
      style={{
        animation: "shimmer 1.5s infinite linear"
      }}
    />
  );
}
