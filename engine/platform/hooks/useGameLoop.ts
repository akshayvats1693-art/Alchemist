import { useEffect, useRef } from 'react';
import type { FrameInput } from '../../engine-core/FrameInput';
import type { GameEngine } from '../../engine-core/GameEngine';

interface GameLoopOptions {
    paused: boolean;
    timeScale: number;
    /**
     * For FPS calculation.
     */
    onTick?: () => void; 
}

export function useGameLoop(engine: GameEngine | null, options: GameLoopOptions) {
    const { paused, timeScale, onTick } = options;

    // Sync state to ref to avoid stale closures in the loop
    const stateRef = useRef({ paused, timeScale });

    useEffect(() => {
        stateRef.current = { paused, timeScale };
    }, [paused, timeScale]);

    const requestRef = useRef<number | undefined>(undefined);
    const lastTimeRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!engine) {return;}

        const animate = (time: number) => {
            if (lastTimeRef.current === undefined) {
                lastTimeRef.current = time;
                requestRef.current = requestAnimationFrame(animate);
                return;
            }

            const msPerFrame = 1000 / 60;
            const elapsed = time - lastTimeRef.current;

            if (elapsed >= msPerFrame) {
                const { paused: isPaused, timeScale: currentScale } = stateRef.current;

                if (!isPaused) {
                    const frameInput: FrameInput = {
                        dt: currentScale / 60,
                        devices: []
                    };
                    engine.tick(frameInput);
                }

                if (onTick) {onTick();}

                // Adjust lastTime to target interval
                lastTimeRef.current = time - (elapsed % msPerFrame);
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {cancelAnimationFrame(requestRef.current);}
            lastTimeRef.current = undefined;
        };
    }, [engine, onTick]);
}
