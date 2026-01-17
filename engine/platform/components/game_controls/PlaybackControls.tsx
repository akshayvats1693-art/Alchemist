import type { FC } from 'react';

interface PlaybackControlsProps {
    paused: boolean;
    onTogglePause: () => void;
    onStepFrame: () => void;
    onRestart: () => void;
}

export const PlaybackControls: FC<PlaybackControlsProps> = ({ paused, onTogglePause, onStepFrame, onRestart }) => {
    return (
        <div className="flex items-center gap-1">
            <button
                className="px-2 py-0.5 rounded text-[10px] bg-[#333] text-gray-300 border border-[#444] hover:bg-[#444] hover:text-white transition-colors flex items-center justify-center group"
                title="Restart Scene"
                onClick={onRestart}
            >
                <svg className="w-3.5 h-3.5 fill-white/80 group-hover:fill-white" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
            </button>
            <button
                className="px-2 py-0.5 rounded text-[10px] bg-[#333] text-gray-300 border border-[#444] hover:bg-[#444] hover:text-white transition-colors flex items-center justify-center group"
                title={paused ? "Play" : "Pause"}
                onClick={onTogglePause}
            >
                {paused ? (
                    <svg className="w-3.5 h-3.5 fill-white/80 group-hover:fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                ) : (
                    <svg className="w-3.5 h-3.5 fill-white/80 group-hover:fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                )}
            </button>
            {paused && (
                <button
                    className="px-2 py-0.5 rounded text-[10px] bg-[#333] text-gray-300 border border-[#444] hover:bg-[#444] hover:text-white transition-colors flex items-center justify-center group"
                    title="Next Frame"
                    onClick={onStepFrame}
                >
                    <svg className="w-3.5 h-3.5 fill-white/80 group-hover:fill-white" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                </button>
            )}
        </div>
    );
};
