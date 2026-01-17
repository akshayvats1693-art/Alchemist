import { ActorComponent } from './ActorComponent';
import { BeginPlayKey, EndPlayKey, PostUpdateKey, RenderKey, SetSceneKey, UpdateKey } from './internal';
import { Bounds } from './math/Bounds';
import { Transform } from './math/Transform';
import { Vector2 } from './math/Vector2';
import { Scene } from './Scene';

export interface ActorConfig {
    name?: string;
    position?: Vector2 | { x: number, y: number };
    components?: ActorComponent[];
}

export class Actor {
    private _name: string;
    private _scene: Scene | null = null;
    private _components: ActorComponent[] = [];
    private _hasBegunPlay = false;

    /**
     * Default component always present.
     */
    public readonly transform: Transform;

    constructor(config: ActorConfig = {}, components?: ActorComponent[]) {
        this._name = config.name ?? 'Actor';

        // Initialize default transform
        this.transform = new Transform();
        if (config.position) {
            this.transform.position.x = config.position.x;
            this.transform.position.y = config.position.y;
        }

        // Add config components
        if (config.components) {
            for (const c of config.components) {
                this.addComponent(c);
            }
        }

        // Add additional components (backward compatibility or convenience)
        if (components) {
            for (const c of components) {
                this.addComponent(c);
            }
        }
    }

    get name(): string { return this._name; }
    set name(value: string) { this._name = value; }

    get scene(): Scene | null { return this._scene; }

    /**
     * Get all components attached to this actor.
     */
    get components(): readonly ActorComponent[] { return this._components; }

    /**
     * Friend access: Scene calls this.
     */
    public [SetSceneKey](value: Scene | null) {
        this._scene = value;
    }

    public addComponent<T extends ActorComponent>(component: T): T {
        component.actor = this;
        this._components.push(component);
        if (this._hasBegunPlay) {
            component.beginPlay();
        }
        return component;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getComponent<T extends ActorComponent>(type: (new (...args: any[]) => T) | string): T | undefined {
        for (const c of this._components) {
            if (typeof type === 'string') {
                if (c.constructor.name === type) {
                    return c as T;
                }
            } else if (c instanceof type) {
                return c;
            }
        }
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getAllComponents<T extends ActorComponent>(type: new (...args: any[]) => T): T[] {
        return this._components.filter(c => c instanceof type) as T[];
    }

    public removeComponent(component: ActorComponent): void {
        const index = this._components.indexOf(component);
        if (index >= 0) {
            component.endPlay();
            this._components.splice(index, 1);
        }
    }

    public [BeginPlayKey](): void {
        this._hasBegunPlay = true;
        // Snapshot 
        const componentsToStart = [...this._components];

        this.beginPlay();

        for (const c of componentsToStart) {
            c.beginPlay();
        }
    }

    public [UpdateKey](dt: number): void {
        this.tick(dt);
        for (const c of this._components) {
            c.tick(dt);
        }
    }

    public [PostUpdateKey](dt: number): void {
        this.postTick(dt);
        for (const c of this._components) {
            c.postTick(dt);
        }
    }

    public [RenderKey](dt: number): void {
        this.render(dt);
        for (const c of this._components) {
            c.render(dt);
        }
    }

    public [EndPlayKey](): void {
        this.endPlay();
        for (const c of this._components) {
            c.endPlay();
        }
        this._hasBegunPlay = false;
    }

    /**
     * Users override these.
     */
    protected beginPlay(): void { }
    protected tick(dt: number): void { }
    protected postTick(dt: number): void { }
    protected render(dt: number): void { }
    protected endPlay(): void { }

    /**
     * Get the aggregated bounds of all components on this actor.
     */
    public getBounds(): Bounds {
        const bounds = new Bounds();
        for (const c of this._components) {
            bounds.encapsulateBounds(c.getBounds());
        }
        return bounds;
    }

    /**
     * Destroy the actor. This signals the scene to remove it.
     */
    public destroy(): void {
        if (this._scene) {
            this._scene.removeActor(this);
        }
    }
}
