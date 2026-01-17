import { ActionBinder, type ActionBinderConfig } from './action/ActionBinder';
import { Actor } from './Actor';
import type { EngineContext } from './EngineContext';
import type { GameEngine } from './GameEngine';
import { GameSystem } from './GameSystem';
import { BeginPlayKey, EndPlayKey, PostUpdateKey, RenderKey, SetGameEngineKey, SetSceneKey, UpdateKey } from './internal';
import { DeterministicRng } from './math/DeterministicRng';

export interface SceneConfig {
    systems?: GameSystem[];
    actors?: Actor[];
}

export class Scene {
    private _gameEngine: GameEngine | null = null;
    private _actors: Actor[] = [];
    private _systems: GameSystem[] = [];
    private _hasBegun = false;

    private _rng = new DeterministicRng(1337);

    /**
     * Random number generator for the scene.
     * Defaults to DeterministicRng(1337) for global determinism.
     */
    public random: () => number = () => this._rng.next();

    constructor(config: SceneConfig = {}) {
        if (config.systems) {
            for (const s of config.systems) {
                this.addSystem(s);
            }
        }
        if (config.actors) {
            for (const a of config.actors) {
                this.addActor(a);
            }
        }
    }

    /**
     * Friend access: GameEngine calls this.
     */
    public [SetGameEngineKey](engine: GameEngine) {
        this._gameEngine = engine;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getEngineContext<T extends EngineContext>(type: new (...args: any[]) => T): T | undefined {
        return this._gameEngine?.getEngineContext(type);
    }

    // Accessor if needed strictly, or use internal field.
    // We kept _gameEngine private. Systems might need it? 
    // Systems usually need contexts, which are now copied.
    /**
     * If we need engine access, we can expose getter.
     */
    public get gameEngine(): GameEngine {
        if (!this._gameEngine) { throw new Error("Scene not attached to GameEngine"); }
        return this._gameEngine;
    }

    public get actors(): readonly Actor[] {
        return this._actors;
    }

    public addActor(actor: Actor): void {
        if (actor.scene) {
            throw new Error("Actor already belongs to a scene");
        }
        actor[SetSceneKey](this);
        this._actors.push(actor);
        if (this._hasBegun) {
            actor[BeginPlayKey]();
        }
    }

    public removeActor(actor: Actor): void {
        const index = this._actors.indexOf(actor);
        if (index >= 0) {
            actor[EndPlayKey]();
            actor[SetSceneKey](null);
            this._actors.splice(index, 1);
        }
    }

    public findActorByName(name: string): Actor | undefined {
        return this._actors.find(a => a.name === name);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public findActorByClass<T extends Actor>(type: new (...args: any[]) => T): T | undefined {
        return this._actors.find(a => a instanceof type) as T;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public findAllActorsByClass<T extends Actor>(type: new (...args: any[]) => T): T[] {
        return this._actors.filter(a => a instanceof type) as T[];
    }

    public addSystem(system: GameSystem): void {
        system.scene = this;
        this._systems.push(system);
        if (this._hasBegun) {
            system.beginPlay();
        }
    }

    public removeSystem(system: GameSystem): void {
        const index = this._systems.indexOf(system);
        if (index >= 0) {
            system.endPlay();
            this._systems.splice(index, 1);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getSystem<T extends GameSystem>(type: new (...args: any[]) => T): T | undefined {
        return this._systems.find(s => s instanceof type) as T;
    }

    public beginPlay(): void {
        this._hasBegun = true;
        for (const sys of this._systems) {
            sys.beginPlay();
        }
        for (const actor of this._actors) {
            actor[BeginPlayKey]();
        }
    }

    public tick(dt: number): void {
        for (const sys of this._systems) {
            sys.tick(dt);
        }

        const actors = [...this._actors];
        for (const actor of actors) {
            if (actor.scene === this) {
                actor[UpdateKey](dt);
            }
        }

        for (const actor of actors) {
            if (actor.scene === this) {
                actor[PostUpdateKey](dt);
            }
        }

        for (const sys of this._systems) {
            sys.postTick(dt);
        }
    }

    public render(dt: number): void {
        const actors = [...this._actors];
        for (const actor of actors) {
            if (actor.scene === this) {
                actor[RenderKey](dt);
            }
        }

        for (const sys of this._systems) {
            sys.render(dt);
        }
    }

    public endPlay(): void {
        for (const actor of this._actors) {
            actor[EndPlayKey]();
        }
        for (const sys of this._systems) {
            sys.endPlay();
        }
        this._hasBegun = false;
    }

    public createActionBinder(config: ActionBinderConfig): ActionBinder {
        return new ActionBinder(this, config);
    }
}
