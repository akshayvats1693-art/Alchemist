import { ScopedGameBridge } from './bridge/ScopedGameBridge';
import type { EditorSystem } from './EditorSystem';
import type { EngineContext } from './EngineContext';
import type { FrameInput } from './FrameInput';
import type { GameSystem } from './GameSystem';
import type { EngineInstrumentation } from './insights/EngineInstrumentation';
import { SetGameEngineKey } from './internal';
import { Scene } from './Scene';


/**
 * Core Game Engine class that manages the main loop and scene lifecycle.
 *
 * Architecture Role: The Barrier.
 * Keeps the "External World" (EditorSystems, Contexts) isolated from the "Game World" (Scene).
 * It enforces constraints to ensure the Scene operates on immutable FrameInput.
 */
export class GameEngine { /**
     * Removed 'implements IGameBridge'.
     */
    private _scene: Scene | null = null;
    private _sceneFactory: (() => Scene) | null = null;
    private _currentBridge: ScopedGameBridge | null = null;

    public instrumentation: EngineInstrumentation | null = null;

    /**
     * The runtime contexts provided by the user.
     */
    private _contexts: EngineContext[];

    private _sceneStarted: boolean = false;
    public gameTime: number = 0;
    private _frameRenderTime: number = 0;
    /**
     * Explicit tick counter for robustness.
     */
    private _tickCount: number = 0;

    public get frameRenderTime(): number {
        return this._frameRenderTime;
    }

    public editorSystems: EditorSystem[] = [];

    public constructor(contexts: EngineContext[], editorSystems: EditorSystem[] = []) {
        this._contexts = contexts;
        this.editorSystems = editorSystems;
        // Do NOT initialize systems here. Wait for setScene.
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getEngineContext<T extends EngineContext>(type: new (...args: any[]) => T): T | undefined {
        return this._contexts.find(c => c instanceof type) as T;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getGameSystem<T extends GameSystem>(type: new (...args: any[]) => T): T | undefined {
        return this._scene?.getSystem(type);
    }

    public setScene(sceneOrFactory: Scene | (() => Scene)): void {
        // 1. Invalidate old bridge
        if (this._currentBridge) {
            this._currentBridge.invalidate();
            this._currentBridge = null;
        }

        if (this._scene) {
            this._scene.endPlay();
        }

        if (typeof sceneOrFactory === 'function') {
            this._sceneFactory = sceneOrFactory;
            this._scene = sceneOrFactory();
        } else {
            this._sceneFactory = null;
            this._scene = sceneOrFactory;
        }

        this._sceneStarted = false;
        this.gameTime = 0;

        // Inject dependencies using the hidden friend key
        this._scene[SetGameEngineKey](this);

        // 2. Create new bridge
        this._currentBridge = new ScopedGameBridge(this);

        // 3. Re-initialize all systems with the new bridge
        for (const system of this.editorSystems) {
            system.initializeWithScene(this._currentBridge);
        }

        if (this.instrumentation) {
            this.instrumentation.onSceneReset();
        }
    }

    public reloadScene(): void {
        if (this._sceneFactory) {
            console.info("GameEngine: Reloading scene.");
            this.setScene(this._sceneFactory);
        } else {
            console.warn("GameEngine: Cannot reload scene - No factory provided.");
        }
    }

    public get scene(): Scene | null {
        return this._scene;
    }

    private _currentInput: FrameInput | null = null;
    public get currentInput(): FrameInput | null {
        return this._currentInput;
    }

    private _previousInput: FrameInput | null = null;
    public get previousInput(): FrameInput | null {
        return this._previousInput;
    }

    /**
     * Simulation step only. Can be called multiple times per frame for network catchup.
     */
    public simulate(input: FrameInput): void {
        this._previousInput = this._currentInput;
        this._currentInput = input;

        // Decremented? No, tick is just an index.
        this._tickCount += 1;

        if (this._scene) {
            if (!this._sceneStarted) {
                this._scene.beginPlay();
                this._sceneStarted = true;
            }

            const { dt } = input;
            this.gameTime += dt;
            this._scene.tick(dt);
        }
    }

    /**
     * Called before processing input and update.
     * Consolidates EditorSystem input preparation.
     */
    public prepareFrameInput(input: FrameInput): FrameInput {
        if (this.instrumentation) {
            this.instrumentation.onBeginFrame(this._tickCount, input);
        }

        let processedInput = input;

        // Run editor systems
        for (const system of this.editorSystems) {
            processedInput = system.prepareFrameInput(processedInput);

            if (this.instrumentation) {
                // Determine system name (constructor name)
                const { name } = system.constructor;
                this.instrumentation.onSystemExecuted(name, processedInput);
            }
        }
        return processedInput;
    }

    /**
     * Called after update to render the frame.
     */
    public render(dt: number): void {
        if (this._scene) {
            this._scene.render(dt);
        }
    }


    public dispose(): void {
        if (this._scene) {
            this._scene.endPlay();
            this._scene = null;
        }

        // Cleanup editor systems (e.g. Network, Input)
        for (const system of this.editorSystems) {
            if (system.cleanup) {
                system.cleanup();
            }
        }
    }

    /**
     * Main entry point for the engine tick.
     * Call this from your game loop (e.g. RequestAnimationFrame).
     *
     * @param input - The inputs for this frame (must include dt).
     */
    public tick(input: FrameInput): void {
        const startTime = performance.now();

        // Prepare Input
        const processedInput = this.prepareFrameInput(input);

        if (processedInput.dt <= 0) {
            return;
        }

        this.simulate(processedInput);

        // Render
        this.render(processedInput.dt);

        this._frameRenderTime = performance.now() - startTime;
    }
}
