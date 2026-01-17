import { type FC, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { PlatformControls } from './components/PlatformControls';
import { PlatformShell } from './components/PlatformShell';
import { GameEngineContext } from './GameEngineContext';
import { useGameEngine } from './hooks/useGameEngine';
import { useGameLoop } from './hooks/useGameLoop';
import { useNetworking } from './hooks/useNetworking';
import { useOrientation } from './hooks/useOrientation';
import { useRenderStats } from './hooks/useRenderStats';
import type { PlatformProps } from './types';

export const Platform: FC<PlatformProps> = (props) => {
    const { orientation, children } = props;

    // 6. Orientation/Resize Handling
    useOrientation(); // Force re-render on orientation change
    // 1. Engine & Refs
    // We pass 0 as restartKey because we now handle restarts via engine.reloadScene() to preserve Networking
    const { engine, canvasRef, containerRef, overlapRef } = useGameEngine(props, 0);

    const handleManualRestart = () => {
        if (engine) {
            engine.reloadScene();
        }
    };

    // Handle Resize/Orientation
    // Note: Engine RenderSystem handles resize internally via ResizeObserver.
    // The useOrientation hook forces a re-render by updating state when orientation changes.

    // 2. Control State
    // Default to paused until user interaction, unless strict debug mode
    const [paused, setPaused] = useState(true);
    const [timeScale, setTimeScale] = useState(1.0);

    // 3. Stats
    const { onTick, fpsElementRef } = useRenderStats();

    // 4. Game Loop
    useGameLoop(engine, { paused, timeScale, onTick });

    // 5. Networking
    const { networkingState, networkStatus, setNetworkStatus, disconnect } = useNetworking(engine);

    // 7. Auto-Start / Fullscreen Logic
    const [hasInteracted, setHasInteracted] = useState(() => new URLSearchParams(window.location.search).get('debug') === 'true');

    // Import enterFullscreen dynamically or from utils (defined below)
    /**
     * We'll use a simple inline handler that calls our util.
     */
    const handleStart = () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        import('./utils/fullscreen').then(({ enterFullscreen }) => {
            enterFullscreen(orientation).catch(console.error);
        });
        setHasInteracted(true);
        setPaused(false);
    };

    return (
        <PlatformShell ref={containerRef} orientation={orientation}>
            {!hasInteracted && (
                <div
                    role="button"
                    tabIndex={0}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
                    onClick={handleStart}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleStart(); } }}
                >
                    <div className="text-center animate-pulse">
                        <div className="text-4xl text-white font-bold mb-4 tracking-widest">TAP TO START</div>
                        <div className="text-sm text-gray-400">Enable Fullscreen</div>
                    </div>
                </div>
            )}
            <GameEngineContext.Provider value={engine}>
                <div>
                    <PlatformControls
                        engine={engine}
                        containerRef={containerRef}
                        paused={paused}
                        setPaused={setPaused}
                        timeScale={timeScale}
                        setTimeScale={setTimeScale}
                        networkingState={networkingState}
                        networkStatus={networkStatus}
                        setNetworkStatus={setNetworkStatus}
                        disconnect={disconnect}
                        orientation={orientation}
                        renderTimeRef={fpsElementRef}
                        onRestart={handleManualRestart}
                    />
                </div>
                <div className="relative flex-1 min-h-0 flex flex-col">
                    <GameCanvas ref={canvasRef} />
                    {/* Overlay Container - Acts as Input Target if requested */}
                    <div
                        ref={overlapRef}
                        className="absolute inset-0 pointer-events-auto"
                        // Ensure it can receive focus if needed, but pointer-events-auto handles clicks
                        tabIndex={-1}
                        style={{ outline: 'none' }}
                    >
                        {children}
                    </div>
                </div>
            </GameEngineContext.Provider>
        </PlatformShell>
    );
};
