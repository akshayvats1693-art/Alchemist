import { ActionBinder } from '../../engine-core/action/ActionBinder';
import { Actor } from '../../engine-core/Actor';
import { GameSystem } from '../../engine-core/GameSystem';
import { Vector3 } from '../../engine-core/math/Vector3';
import { RenderSystem } from '../render/RenderSystem';
import { InteractableComponent } from './InteractableComponent';

export interface InteractionSystemOptions {
    cursorAction?: string;
    clickAction?: string;
    /**
     * Source ID to listen to.
     * Default: 'Keyboard' (Standard Editor Input).
     */
    sourceId?: string;
    /**
     * Device Index to listen to.
     * Default: 0.
     */
    deviceId?: number;
    /**
     * Optional pre-configured ActionBinder.
     * If provided, sourceId and deviceId are ignored.
     */
    binder?: ActionBinder;
}

export class InteractionSystem extends GameSystem {
    private hoveredActor: Actor | null = null;
    private options: InteractionSystemOptions;

    private binder: ActionBinder | null = null;

    constructor(options: InteractionSystemOptions = {}) {
        super();
        this.options = {
            cursorAction: options.cursorAction ?? 'Cursor',
            clickAction: options.clickAction ?? 'Click',
            sourceId: options.sourceId ?? 'Keyboard',
            deviceId: options.deviceId ?? 0
        };

        if (options.binder) {
            this.binder = options.binder;
        }
    }

    public override beginPlay(): void {
        super.beginPlay();

        if (this.binder) {
            return;
        }

        const sourceId = this.options.sourceId ?? 'Keyboard';
        const deviceId = this.options.deviceId ?? 0;

        this.binder = new ActionBinder(this.scene, {
            sourceId,
            deviceId
        });
    }

    public override tick(dt: number): void {
        const renderer = this.scene.getSystem(RenderSystem);
        if (!renderer || !this.binder) { return; }

        const cursorAction = this.options.cursorAction ?? 'Cursor';
        const clickAction = this.options.clickAction ?? 'Click';

        // We only care if pointer is active or moved
        const { x, y } = this.binder.getVector(cursorAction);
        let origin: Vector3;
        let direction: Vector3;
        try {
            const ray = renderer.getRayFromScreenCoords(x, y);
            origin = ray.origin;
            direction = ray.direction;
        } catch {
            return;
        }

        const hitActor = this.raycast(origin, direction);

        // Handle Hover
        if (hitActor !== this.hoveredActor) {
            if (this.hoveredActor) {
                const comp = this.hoveredActor.getComponent(InteractableComponent);
                comp?._fireHoverExit();
            }
            if (hitActor) {
                const comp = hitActor.getComponent(InteractableComponent);
                comp?._fireHoverEnter();
            }
            this.hoveredActor = hitActor;
        }

        // Handle Click
        if (this.binder.isActionJustPressed(clickAction) && hitActor) {
            const comp = hitActor.getComponent(InteractableComponent);
            comp?._fireClick();
        }
    }

    private raycast(origin: Vector3, direction: Vector3): Actor | null {
        // Simple O(N) Ray vs AABB for now.
        // In future, query physics system.

        // Filter actors with InteractableComponent
        const interactables = this.scene.actors.filter(a => a.getComponent(InteractableComponent));

        let closestActor: Actor | null = null;
        let closestDist = Infinity;

        for (const actor of interactables) {
            const bounds = actor.getBounds();
            // Ray AABB intersection
            // Adapted from generic slab method
            // Bounds min/max
            const { min } = bounds;
            const { max } = bounds;

            const t = this.intersectRayAABB(origin, direction, min, max);
            if (t !== null && t < closestDist) {
                closestDist = t;
                closestActor = actor;
            }
        }

        return closestActor;
    }

    private intersectRayAABB(origin: Vector3, dir: Vector3, min: Vector3, max: Vector3): number | null {
        const t1 = (min.x - origin.x) / dir.x;
        const t2 = (max.x - origin.x) / dir.x;
        const t3 = (min.y - origin.y) / dir.y;
        const t4 = (max.y - origin.y) / dir.y;
        const t5 = (min.z - origin.z) / dir.z;
        const t6 = (max.z - origin.z) / dir.z;

        const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
        const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

        // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behind us
        if (tmax < 0) {
            return null;
        }

        // if tmin > tmax, ray doesn't intersect AABB
        if (tmin > tmax) {
            return null;
        }

        return tmin;
    }
}
