import { ActorComponent } from '../../engine-core/ActorComponent';
import { Vector3 } from '../../engine-core/math/Vector3';
import { BoxCollisionComponent } from './BoxCollisionComponent';
import { PhysicsSystem } from './PhysicsSystem';

export class PhysicsComponent extends ActorComponent {
    public velocity: Vector3 = new Vector3(0, 0, 0);
    public acceleration: Vector3 = new Vector3(0, 0, 0);
    public gravityScale: number = 1.0;

    public override tick(dt: number): void {
        const physicsSystem = this.actor.scene?.getSystem(PhysicsSystem);
        if (!physicsSystem) { return; }

        // Apply Gravity
        const gravity = physicsSystem.gravity.scale(this.gravityScale);

        // v = v0 + a*dt + g*dt
        this.velocity.x += (this.acceleration.x + gravity.x) * dt;
        this.velocity.y += (this.acceleration.y + gravity.y) * dt;
        this.velocity.z += (this.acceleration.z + gravity.z) * dt;

        // Sub-stepping to prevent tunneling
        /**
         * 50ms (or 20fps equivalent step) purely for checking.
         */
        const MAX_STEP_DT = 0.05;
        let remainingDt = dt;

        // Grab collider once
        // We import type usually to avoid circular deps but let's try duck typing or get it safely.
        // We can't import BoxCollisionComponent easily if circular.
        // But getComponent is generic.
        // Let's rely on finding it during beginPlay for perf? Or just get it here.
        // Using string name approach or constructor if known?
        // We can import BoxCollisionComponent if it doesn't import us. BoxCollisionComponent usu imports only core.

        while (remainingDt > 0) {
            const stepDt = Math.min(remainingDt, MAX_STEP_DT);

            this.actor.transform.position.x += this.velocity.x * stepDt;
            this.actor.transform.position.y += this.velocity.y * stepDt;
            this.actor.transform.position.z += this.velocity.z * stepDt;

            // Check for collisions immediately after this micro-move
            const collider = this.actor.getComponent(BoxCollisionComponent);
            if (collider) {
                physicsSystem.checkCollisionsFor(collider);
            }

            remainingDt -= stepDt;
        }
    }
}
