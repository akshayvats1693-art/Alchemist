import type { FC } from 'react';
import { GameEngine } from '../../engine-core/GameEngine';
import type { NetworkingState } from '../types';
import { SandboxControls } from './game_controls/SandboxControls';

interface PlatformControlsProps {
    engine: GameEngine | null;
    containerRef: React.RefObject<HTMLDivElement | null>;
    paused: boolean;
    setPaused: (p: boolean) => void;
    timeScale: number;
    setTimeScale: (s: number) => void;
    networkingState: NetworkingState;
    networkStatus: string;
    setNetworkStatus: (s: string) => void;
    disconnect: () => void;
    orientation: 'portrait' | 'landscape';
    renderTimeRef: React.RefObject<HTMLSpanElement | null>;
    onRestart: () => void;
}

// Re-using SandboxControls for now to avoid duplicating all the sub-components
// In a full v2 refactor, we would decompose SandboxControls as well, 
/**
 * But for this step we will just wrap it.
 */
export const PlatformControls: FC<PlatformControlsProps> = (props) => {
    return <SandboxControls {...props} />;
}
