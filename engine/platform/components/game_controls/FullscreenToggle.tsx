import type { FC } from 'react';
import { toggleFullscreen } from '../../utils/fullscreen';

interface FullscreenToggleProps {
    orientation: 'portrait' | 'landscape';
}

export const FullscreenToggle: FC<FullscreenToggleProps> = ({ orientation }) => {
    const handleToggleFullscreen = () => {
        toggleFullscreen(orientation).catch(console.error);
    };

    return (
        <div className="border-l border-[#333] pl-2 flex gap-2">
            <button
                title="Toggle Fullscreen"
                className="px-2 py-0.5 rounded text-[10px] bg-[#333] text-gray-300 border border-[#444] hover:bg-[#444] hover:text-white transition-colors flex items-center gap-1"
                onClick={handleToggleFullscreen}
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            </button>
        </div>
    );
};
