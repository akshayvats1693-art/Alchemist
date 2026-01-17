import { forwardRef } from 'react';
import { GameEngine } from '../../../engine-core/GameEngine';

interface RenderStatsProps {
    engine: GameEngine | null;
}

export const RenderStats = forwardRef<HTMLSpanElement, RenderStatsProps>(({ engine }, ref) => {
    return (
        <div className="flex items-center gap-2 px-2 border-l border-[#444] h-4">
            <span ref={ref} className="text-[10px] font-mono text-white/50 tabular-nums min-w-[5ch]">
                0.00ms
            </span>
        </div>
    );
});
RenderStats.displayName = 'RenderStats';
