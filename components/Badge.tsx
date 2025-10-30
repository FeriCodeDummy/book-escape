import React from "react";

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white/60 backdrop-blur-sm shadow-sm">
{children}
</span>
);

export default Badge;