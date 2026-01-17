
import { Actor } from '../../engine-core/Actor';
import { GameSystem } from '../../engine-core/GameSystem';
import { Vector3 } from '../../engine-core/math/Vector3';
import type { BoxCollisionComponent } from './BoxCollisionComponent';

/**
 * Interface for components that want to handle collisions.
 */
export interface CollisionListener {
    onCollision: (other: Actor, self: BoxCollisionComponent, otherCollider: BoxCollisionComponent) => void;
}

function isCollisionListener(c: unknown): c is CollisionListener {
    return typeof c === 'object' && c !== null && typeof (c as CollisionListener).onCollision === 'function';
}


export class PhysicsSystem extends GameSystem {
    /** Default ~1000px/s^2 down. (Y-down system: gravity is positive Y). */
    public gravity: Vector3 = new Vector3(0, 0, 0);

    private colliders: BoxCollisionComponent[] = [];

    public register(collider: BoxCollisionComponent) {
        if (!this.colliders.includes(collider)) {
            this.colliders.push(collider);
        }
    }

    public unregister(collider: BoxCollisionComponent) {
        const idx = this.colliders.indexOf(collider);
        if (idx >= 0) {
            this.colliders.splice(idx, 1);
        }
    }

    public override tick(dt: number): void {
        const activeColliders = [...this.colliders];
        const count = activeColliders.length;
        for (let i = 0; i < count; i += 1) {
            for (let j = i + 1; j < count; j += 1) {
                this.checkPair(activeColliders[i], activeColliders[j]);
            }
        }
    }

    /**
     * Checks collisions for a specific collider against all others.
     * Useful for continuous collision detection (sub-stepping) in components.
     */
    public checkCollisionsFor(target: BoxCollisionComponent): void {
        for (const other of this.colliders) {
            if (other === target) { continue; }
            this.checkPair(target, other);
        }
    }

    private checkPair(a: BoxCollisionComponent, b: BoxCollisionComponent): void {
        if (!a.overlaps(b)) {
            return;
        }

        // Resolve Collision first
        // Only resolve if neither is a trigger
        if (!a.isTrigger && !b.isTrigger) {
            this.resolveCollision(a, b);
        }

        this.notifyCollision(a, b);
        this.notifyCollision(b, a);
    }

    private resolveCollision(a: BoxCollisionComponent, b: BoxCollisionComponent): void {
        // Calculate overlap per axis
        const aPos = a.actor.transform.position.add(a.offset);
        const bPos = b.actor.transform.position.add(b.offset);

        const aHalfX = a.size.x / 2;
        const bHalfX = b.size.x / 2;
        const dx = aPos.x - bPos.x;
        const overlapX = (aHalfX + bHalfX) - Math.abs(dx);

        const aHalfY = a.size.y / 2;
        const bHalfY = b.size.y / 2;
        const dy = aPos.y - bPos.y;
        const overlapY = (aHalfY + bHalfY) - Math.abs(dy);

        // Preference to slide if overlap is small (Corner Smoothing)
        // If we just graze the corner (e.g. 5-6px), push us OUT that way (slide),
        // rather than stopping us dead in the main movement direction.
        /**
         * 20% of 40px tile.
         */
        const SLIDE_THRESHOLD = 8;

        let separateOnX: boolean;

        if (overlapX < overlapY) {
            // Usually deeper in Y, so separate X.
            // BUT, if overlapY is tiny (corner graze), we might prefer to separate Y (slide)
            // Heuristic check
            const isCornerGraze = overlapY <= SLIDE_THRESHOLD && overlapX > overlapY * 0.5;
            separateOnX = !isCornerGraze;
        } else {
            // Usually deeper in X, separate Y.
            // Similarly, if overlapX is tiny, separate X?
            const isCornerGraze = overlapX <= SLIDE_THRESHOLD && overlapY > overlapX * 0.5;
            separateOnX = isCornerGraze;
        }

        if (separateOnX) {
            // Separate on X
            const separation = overlapX * (dx > 0 ? 1 : -1);
            if (a.isStatic && !b.isStatic) {
                b.actor.transform.position.x -= separation;
            } else if (!a.isStatic && b.isStatic) {
                a.actor.transform.position.x += separation;
            } else if (!a.isStatic && !b.isStatic) {
                a.actor.transform.position.x += separation * 0.5;
                b.actor.transform.position.x -= separation * 0.5;
            }
        } else {
            // Separate on Y
            const separation = overlapY * (dy > 0 ? 1 : -1);
            if (a.isStatic && !b.isStatic) {
                b.actor.transform.position.y -= separation;
            } else if (!a.isStatic && b.isStatic) {
                a.actor.transform.position.y += separation;
            } else if (!a.isStatic && !b.isStatic) {
                a.actor.transform.position.y += separation * 0.5;
                b.actor.transform.position.y -= separation * 0.5;
            }
        }
    }

    private notifyCollision(self: BoxCollisionComponent, other: BoxCollisionComponent) {
        // self.actor throws if not present, so no need to check

        // Notify Components
        for (const component of self.actor.components) {
            if (isCollisionListener(component)) {
                component.onCollision(other.actor, self, other);
            }
        }

        // Notify Actor
        if (isCollisionListener(self.actor)) {
            self.actor.onCollision(other.actor, self, other);
        }
    }


    public raycast(origin: Vector3, direction: Vector3): RaycastResult[] {
        const results: RaycastResult[] = [];
        for (const collider of this.colliders) {
            const hit = this.intersectRayAABB(origin, direction, collider);
            if (hit) {
                results.push(hit);
            }
        }
        return results.sort((a, b) => a.distance - b.distance);
    }

    private intersectRayAABB(origin: Vector3, direction: Vector3, collider: BoxCollisionComponent): RaycastResult | null {
        const pos = collider.actor.transform.position.add(collider.offset);
        const half = collider.size.scale(0.5);
        const min = pos.sub(half);
        const max = pos.add(half);

        let tmin = (min.x - origin.x) / direction.x;
        let tmax = (max.x - origin.x) / direction.x;
        if (tmin > tmax) {
            [tmin, tmax] = [tmax, tmin];
        }

        let tymin = (min.y - origin.y) / direction.y;
        let tymax = (max.y - origin.y) / direction.y;
        if (tymin > tymax) {
            [tymin, tymax] = [tymax, tymin];
        }

        if ((tmin > tymax) || (tymin > tmax)) {
            return null;
        }
        if (tymin > tmin) {
            tmin = tymin;
        }
        if (tymax < tmax) {
            tmax = tymax;
        }

        let tzmin = (min.z - origin.z) / direction.z;
        let tzmax = (max.z - origin.z) / direction.z;
        if (tzmin > tzmax) {
            [tzmin, tzmax] = [tzmax, tzmin];
        }

        if ((tmin > tzmax) || (tzmin > tmax)) {
            return null;
        }
        if (tzmin > tmin) {
            tmin = tzmin;
        }
        if (tzmax < tmax) {
            // tmax = tzmax; // Unused
        }

        if (tmin < 0) {
            return null;
        }

        const point = origin.add(direction.scale(tmin));
        return {
            actor: collider.actor,
            collider,
            point,
            distance: tmin
        };
    }
}

export interface RaycastResult {
    actor: Actor;
    collider: BoxCollisionComponent;
    point: Vector3;
    distance: number;
}
