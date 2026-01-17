import type { EngineContext } from '../EngineContext';
import type { FrameInput } from '../FrameInput';
import type { GameEngine } from '../GameEngine';
import type { GameSystem } from '../GameSystem';
import type { IGameBridge } from './IGameBridge';

export class ScopedGameBridge implements IGameBridge {
    private valid = true;
    private engine: GameEngine;

    constructor(engine: GameEngine) {
        this.engine = engine;
    }

    invalidate() {
        this.valid = false;
    }

    private ensureValid() {
        if (!this.valid) { throw new Error("Accessing stale GameBridge. Bridge is revoked on scene change."); }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getEngineContext<T extends EngineContext>(type: new (...args: any[]) => T): T | undefined {
        this.ensureValid();
        return this.engine.getEngineContext(type);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getGameSystem<T extends GameSystem>(type: new (...args: any[]) => T): T | undefined {
        this.ensureValid();
        return this.engine.getGameSystem(type);
    }

    simulate(input: FrameInput): void {
        this.ensureValid();
        this.engine.simulate(input);
    }

    reloadScene(): void {
        this.ensureValid();
        this.engine.reloadScene();
    }
}
