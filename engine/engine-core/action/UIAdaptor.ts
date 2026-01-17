import { useEffect, useState } from 'react';
import type { IGameBridge } from '../bridge/IGameBridge';
import type { GameSystem } from '../GameSystem';
import { ActionAdaptor } from './ActionAdaptor';

/**
 * Base class for UI-driven Action Adaptors.
 * Provides React hooks for accessing Game Systems and managing Scene lifecycles.
 */
export abstract class UIAdaptor extends ActionAdaptor {
    protected bridge?: IGameBridge;
    private sceneChangeListeners: (() => void)[] = [];

    public initializeWithScene(bridge: IGameBridge): void {
        this.bridge = bridge;
        // Notify listeners (hooks) that the scene (and thus systems) have changed
        this.sceneChangeListeners.forEach(cb => { cb(); });
    }

    /**
     * React Hook: Returns the current instance of the requested GameSystem.
     * Automatically updates when the scene reloads.
     * MUST be called from within a React Component.
     */

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public useGameSystem<T extends GameSystem>(systemClass: new (...args: any[]) => T): T | undefined {
        // 1. Initialize state with current system instance
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [system, setSystem] = useState<T | undefined>(() =>
            this.bridge?.getGameSystem(systemClass)
        );

        // 2. Subscribe to scene changes to refresh the system instance
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            /** Internal helper to refresh state. */
            const refresh = () => {
                const newSystem = this.bridge?.getGameSystem(systemClass);
                setSystem(newSystem);
            };

            // Handle case where scene might have changed before effect ran
            refresh();

            // Register listener
            this.sceneChangeListeners.push(refresh);
            return () => {
                this.sceneChangeListeners = this.sceneChangeListeners.filter(cb => cb !== refresh);
            };
        }, [systemClass]); // Re-run if requested system class changes (unlikely)

        return system;
    }

    /**
     * Request the engine to reload the current scene.
     */
    public restartScene() {
        this.bridge?.reloadScene();
    }
}
