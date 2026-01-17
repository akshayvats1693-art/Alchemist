import { Scene } from './Scene';

export class GameSystem {
    /**
     * Architecture Role: Logic & Bridge.
     *
     * This system has access to EngineContexts (via Scene), allowing it to interact with the External World.
     * CAUTION: This system has high privileges ("too much power").
     * - Can interface with External Systems (e.g. Rendering).
     * - Can modify the Scene.
     * - MUST ensure data flow only; avoid retaining references to mutable external objects.
     */
    private _scene: Scene | null = null;

    get scene(): Scene {
        if (!this._scene) {
            throw new Error(`GameSystem ${this.constructor.name} is not attached to a scene.`);
        }
        return this._scene;
    }

    set scene(value: Scene) {
        this._scene = value;
    }

    public beginPlay(): void { }

    public tick(dt: number): void { }

    public postTick(dt: number): void { }

    public render(dt: number): void { }

    public endPlay(): void { }
}
