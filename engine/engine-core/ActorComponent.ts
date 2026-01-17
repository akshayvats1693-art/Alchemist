import type { Actor } from './Actor';
import { Bounds } from './math/Bounds';

export class ActorComponent {
    private _actor: Actor | null = null;
    private _hasBegunPlay = false;

    get actor(): Actor {
        if (!this._actor) {
            throw new Error(`ActorComponent ${this.constructor.name} is not attached to an actor.`);
        }
        return this._actor;
    }

    set actor(value: Actor) {
        this._actor = value;
    }

    /**
     * Called when the game starts or when the component is added to an active actor.
     */
    public beginPlay(): void {
        this._hasBegunPlay = true;
    }

    /**
     * Called every frame.
     *
     * @param dt - Delta time in seconds.
     */
    public tick(dt: number): void {
        // Override me
    }

    /**
     * Called every frame after all actors have ticked.
     *
     * @param dt - Delta time in seconds.
     */
    public postTick(dt: number): void {
        // Override me
    }

    /**
     * Called every frame to render the component.
     *
     * @param dt - Delta time in seconds.
     */
    public render(dt: number): void {
        // Override me
    }

    /**
     * Called when the component is removed or the actor is destroyed.
     */
    public endPlay(): void {
        this._hasBegunPlay = false;
    }

    /**
     * Get the bounds of this component in world space.
     * Default returns invalid bounds.
     */
    public getBounds(): Bounds {
        return new Bounds();
    }
}
