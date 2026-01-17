
import type { ReactNode } from 'react';
import type { EditorSystem } from '../engine-core/EditorSystem';
import type { EngineContext } from '../engine-core/EngineContext';
import type { GameEngine } from '../engine-core/GameEngine';
import type { Scene } from '../engine-core/Scene';

export interface PlatformProps {
    scene: Scene | (() => Scene);
    /** Generic enough. */
    engineClass?: new (contexts: never[], editorSystems: EditorSystem[]) => GameEngine;
    onEngineInit?: (engine: GameEngine) => void;
    children?: ReactNode;
    orientation: 'portrait' | 'landscape';
    /**
     * The runtime contexts provided by the user (e.g. InputSystemContext).
     * These will be merged with default contexts (RenderContext, NetworkContext, etc).
     */
    contexts?: EngineContext[];
    /**
     * Custom editor systems to inject (e.g. ActionAdaptors).
     */
    editorSystems?: EditorSystem[];
}

export interface NetworkingState {
    connected: boolean;
    isHost: boolean;
    roomId: string;
    connectionState: string;
    clientCount: number;
}
