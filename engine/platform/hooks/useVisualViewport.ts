import { useEffect, useState } from 'react';

/**
 * A hook to get the precise visual viewport height.
 * 
 * Tradeoffs of JS-based sizing vs CSS (100dvh):
 * 1. Performance: Adds a resize listener and state update (negligible for a root container).
 * 2. Precision: Window.visualViewport accounts for on-screen keyboards and pinch-zoom,
 *    which pure CSS units often miss or delay.
 * 3. Robutness: The polling fallback ensures the layout recovers even if browser UI
 *    animation events are inconsistent (common on some mobile browsers).
 */
export function useVisualViewport() {
    const [height, setHeight] = useState<string>('100dvh');

    useEffect(() => {
        const updateHeight = () => {
            // Priority: visualViewport (handles pinch-zoom/keyboard) -> innerHeight (standard)
            const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            setHeight(`${String(h)}px`);
        };

        window.addEventListener('resize', updateHeight);
        window.visualViewport?.addEventListener('resize', updateHeight);

        // Initial sync
        updateHeight();

        // Safety: Polling ensures we catch the end of browser UI transitions 
        // that might not fire a final resize event or fire it early.
        const intervalId = setInterval(updateHeight, 500);

        return () => {
            window.removeEventListener('resize', updateHeight);
            window.visualViewport?.removeEventListener('resize', updateHeight);
            clearInterval(intervalId);
        };
    }, []);

    return height;
}
