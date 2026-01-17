import { useRef } from 'react';

export function useRenderStats() {
    const lastFpsUpdateRef = useRef<number>(0);
    const frameCountRef = useRef<number>(0);
    const fpsHistoryRef = useRef<number[]>([]);
    const fpsRef = useRef<number>(0);

    // Element ref to avoid state updates for high frequency FPS
    const fpsElementRef = useRef<HTMLSpanElement>(null);

    const onTick = () => {
        const time = performance.now();
        frameCountRef.current += 1;
        const timeSinceLastUpdate = time - lastFpsUpdateRef.current;

        if (timeSinceLastUpdate >= 200) {
            const currentFps = (frameCountRef.current / timeSinceLastUpdate) * 1000;

            const buffer = fpsHistoryRef.current;
            buffer.push(currentFps);
            if (buffer.length > 10) { buffer.shift(); }

            const avgFps = Math.round(buffer.reduce((a, b) => a + b, 0) / buffer.length);
            fpsRef.current = avgFps;

            if (fpsElementRef.current) {
                fpsElementRef.current.textContent = `${avgFps.toString()} FPS`;
            }

            lastFpsUpdateRef.current = time;
            frameCountRef.current = 0;
        }
    };

    return { onTick, fpsElementRef };
}
