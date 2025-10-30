import {Star} from "lucide-react";
import React from "react";

const StarRating: React.FC<{ value: number; count?: number }> = ({ value, count }) => {
    const full = Math.round(value * 2) / 2; // halves
    const stars = [0,1,2,3,4].map(i => (
        <Star key={i} className={`h-4 w-4 ${i < Math.floor(full) ? '' : 'opacity-30'}`} fill="currentColor" />
    ));
    return (
        <div className="flex items-center gap-1 text-amber-500">
            {stars}
            <span className="ml-1 text-xs text-neutral-600">{value ? value.toFixed(1) : "New"}{ typeof count === 'number' && count > 0 ? ` (${count})` : ''}</span>
        </div>
    );
};

export default StarRating;
