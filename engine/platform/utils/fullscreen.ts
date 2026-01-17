
export const enterFullscreen = async (orientation: 'portrait' | 'landscape') => {
    if (!document.fullscreenElement) {
        try {
            await document.documentElement.requestFullscreen();
            // Use type assertion for Screen Orientation API compatibility
            const s = window.screen as unknown as { orientation?: { lock: (o: string) => Promise<void>; unlock: () => void } };
            if (s.orientation?.lock) {
                await s.orientation.lock(orientation);
            }
        } catch (error) {
            console.warn('Fullscreen/Orientation request failed:', error);
        }
    }
};

export const exitFullscreen = async () => {
    if (document.fullscreenElement) {
        try {
            await document.exitFullscreen();
            const s = window.screen as unknown as { orientation?: { lock: (o: string) => Promise<void>; unlock: () => void } };
            if (s.orientation?.unlock) {
                s.orientation.unlock();
            }
        } catch (error) {
            console.warn('Exit Fullscreen/Orientation failed:', error);
        }
    }
};

export const toggleFullscreen = async (orientation: 'portrait' | 'landscape') => {
    if (document.fullscreenElement) {
        await exitFullscreen();
    } else {
        await enterFullscreen(orientation);
    }
};
