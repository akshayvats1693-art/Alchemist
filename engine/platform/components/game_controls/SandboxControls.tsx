
import { type FC, useState } from 'react';
import type { FrameInput } from '../../../engine-core/FrameInput';
import type { GameEngine } from '../../../engine-core/GameEngine';
import type { NetworkingState } from '../../types';
import { InsightsPanel } from '../insights/InsightsPanel';
import { ControlBar } from './ControlBar';
import { FullscreenToggle } from './FullscreenToggle';
import { HomeButton } from './HomeButton';
import { InsightsToggle } from './InsightsToggle';
import { NetworkingControls } from './NetworkingControls';
import { PlaybackControls } from './PlaybackControls';
import { RenderStats } from './RenderStats';
import { TimeControls } from './TimeControls';

// Update SandboxControls API to lift state up or expose it
interface SandboxControlsProps {
    engine: GameEngine | null;
    /** Lifted State. */
    paused: boolean;
    setPaused: (paused: boolean) => void;
    timeScale: number;
    setTimeScale: (scale: number) => void;

    /** Networking State. */
    /** Networking State. */
    networkingState: NetworkingState;
    networkStatus: string;
    setNetworkStatus: (status: string) => void;
    disconnect: () => void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    containerRef: React.RefObject<any>;
    orientation: 'portrait' | 'landscape';
    renderTimeRef: React.RefObject<HTMLSpanElement | null>;
    onRestart: () => void;
}

export const SandboxControls: FC<SandboxControlsProps> = (props) => {
    const {
        engine,
        // containerRef,
        paused,
        setPaused,
        timeScale,
        setTimeScale,
        networkingState,
        networkStatus,
        setNetworkStatus,
        disconnect,
        orientation,
        renderTimeRef
    } = props;
    // UI State mostly lifted to parent now
    const [manualStepDt, setManualStepDt] = useState(1 / 60);
    const [showInsights, setShowInsights] = useState(false);

    // Networking logic (subscription moved to parent)
    // We only keep handleCreateHost which triggers actions.

    /**
     * UI Interaction Handlers.
     */
    const togglePause = () => { setPaused(!paused); };

    const stepFrame = () => {
        if (!engine) { return; }
        const frameInput: FrameInput = {
            dt: 1 / 120,
            devices: [],

        };
        let dt = manualStepDt;
        while (dt > 0) {
            engine.tick(frameInput);
            dt -= 1 / 120;
        }
    };

    const { onRestart } = props;
    const handleRestart = () => {
        onRestart();
    };

    return (
        <>
            <ControlBar>
                <HomeButton />
                <PlaybackControls
                    paused={paused}
                    onTogglePause={togglePause}
                    onStepFrame={stepFrame}
                    onRestart={handleRestart}
                />

                <TimeControls
                    paused={paused}
                    timeScale={timeScale}
                    manualStepDt={manualStepDt}
                    onTimeScaleChange={setTimeScale}
                    onManualStepDtChange={setManualStepDt}
                />

                <NetworkingControls
                    engine={engine}
                    networkingState={networkingState}
                    networkStatus={networkStatus}
                    setNetworkStatus={setNetworkStatus}
                    disconnect={disconnect}
                />

                <RenderStats ref={renderTimeRef} engine={engine} />

                <InsightsToggle showInsights={showInsights} setShowInsights={setShowInsights} />

                <FullscreenToggle orientation={orientation} />
            </ControlBar>
            {showInsights && <InsightsPanel engine={engine} />}
        </>
    );
};
