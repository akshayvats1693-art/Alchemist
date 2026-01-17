import type { FC } from 'react';

export const HomeButton: FC = () => {
    return (
        <div className="border-r border-[#333] pr-2 flex gap-2">
            <button
                className="px-2 py-0.5 rounded text-[10px] bg-[#333] text-gray-300 border border-[#444] hover:bg-[#444] hover:text-white transition-colors flex items-center gap-1"
                title="Back to Launcher"
                onClick={() => { window.location.href = window.location.pathname; }}
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </button>
        </div>
    );
};
