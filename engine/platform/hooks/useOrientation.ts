import { useEffect, useState } from 'react';

export function useOrientation() {
    const [restartKey, setRestartKey] = useState(0);

    // eslint-disable-next-line fsecond/valid-event-listener
    useEffect(() => {
        const handleOrientationChange = () => {
            // Small timeout to allow layout to settle
            setTimeout(() => {
                setRestartKey(prev => prev + 1);
            }, 100);
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        return () => { window.removeEventListener('orientationchange', handleOrientationChange); };
    }, []);

    return restartKey;
}
