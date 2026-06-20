import React from "react";

export default function YbexLogo({ className = "" }) {
  return (
    <div className={`inline-flex items-center font-sans font-black tracking-tighter select-none text-xl sm:text-2xl ${className}`}>
      <span className="text-foreground">Yb</span>
      <span className="text-[#D9F111]">e</span>
      <span className="text-foreground">x</span>
    </div>
  );
}

