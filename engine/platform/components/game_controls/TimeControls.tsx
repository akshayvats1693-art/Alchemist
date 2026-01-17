import type { ChangeEvent, FC } from 'react';

interface TimeControlsProps {
    paused: boolean;
    timeScale: number;
    manualStepDt: number;
    onTimeScaleChange: (val: number) => void;
    onManualStepDtChange: (val: number) => void;
}

function formatTimeScale(val: number): string {
    if (val < 0.01) { return val.toFixed(3); }
    if (val < 1) { return val.toFixed(2); }
    return val.toFixed(1);
}

export const TimeControls: FC<TimeControlsProps> = (props) => {
    const { paused, timeScale, manualStepDt, onTimeScaleChange, onManualStepDtChange } = props;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (paused) {
            onManualStepDtChange(val);
        } else {
            onTimeScaleChange(val);
        }
    };

    return (
        <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1 flex items-center">
                {paused ? (
                    <input type="range" min="0" max="10" step="0.001" value={manualStepDt} className="w-full h-1 bg-[#444] rounded-full appearance-none cursor-default accent-[#0A84FF] hover:accent-[#409CFF] focus:outline-none" onChange={handleChange} />
                ) : (
                    <input type="range" min="0.001" max="10" step="0.001" value={timeScale} className="w-full h-1 bg-[#444] rounded-full appearance-none cursor-default accent-[#0A84FF] hover:accent-[#409CFF] focus:outline-none" onChange={handleChange} />
                )}
            </div>
            <span className="text-xs font-mono font-medium tabular-nums min-w-[3.5ch] text-right text-white/80">
                {paused ? `${manualStepDt.toFixed(3)}s` : `${formatTimeScale(timeScale)}x`}
            </span>
        </div>
    );
};
