import { forwardRef } from 'react';

export const RenderStatsDisplay = forwardRef<HTMLSpanElement>((_, ref) => {
    return (
        <div className="flex items-center gap-2 border-l border-[#333] pl-2 opacity-50">
            <span ref={ref} className="text-[10px] font-mono variant-numeric-tabular nums-tabular">
                0 FPS
            </span>
        </div>
    );
});

RenderStatsDisplay.displayName = 'RenderStatsDisplay';
