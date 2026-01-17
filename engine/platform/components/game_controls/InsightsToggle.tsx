import type { FC } from 'react';

interface InsightsToggleProps {
    showInsights: boolean;
    setShowInsights: (show: boolean) => void;
}

export const InsightsToggle: FC<InsightsToggleProps> = ({ showInsights, setShowInsights }) => {
    return (
        <div className="hidden lg:block border-l border-[#333] pl-2">
            <button
                title="Toggle Input Insights"
                className={`relative px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-2 transition-all ${showInsights
                    ? 'bg-green-900/30 text-green-200 border-green-800'
                    : 'bg-[#333] text-white/50 border-[#444] hover:text-white/80 hover:border-[#666]'
                    }`}
                onClick={() => { setShowInsights(!showInsights); }}
            >
                <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24">
                    <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h2v2H7V7zm4 0h2v2h-2V7zm4 0h2v2h-2V7zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                </svg>
                INSIGHTS
            </button>
        </div>
    );
};
