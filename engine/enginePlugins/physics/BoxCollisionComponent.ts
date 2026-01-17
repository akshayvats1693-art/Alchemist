import { ActorComponent } from '../../engine-core/ActorComponent';
import { Vector3 } from '../../engine-core/math/Vector3';
import { PhysicsSystem } from './PhysicsSystem';

export class BoxCollisionComponent extends ActorComponent {
    /**
     * The size of the collision box.
     */
    public size: Vector3 = new Vector3(1, 1, 1);

    /**
     * Optional offset from the actor's pivot.
     */
    public offset: Vector3 = new Vector3(0, 0, 0);

    /** If true, this object will not be moved by physics resolution. */
    public isStatic: boolean = false;

    /** If true, this object will not cause physical resolution, only callbacks. */
    public isTrigger: boolean = false;

    public override beginPlay(): void {
        const physics = this.actor.scene?.getSystem(PhysicsSystem);
        physics?.register(this);
    }

    public override endPlay(): void {
        const physics = this.actor.scene?.getSystem(PhysicsSystem);
        physics?.unregister(this);
    }

    /**
     * Checks if this collision box overlaps with another one.
     */
    public overlaps(other: BoxCollisionComponent): boolean {
        const myPos = this.actor.transform.position.add(this.offset);
        const otherPos = other.actor.transform.position.add(other.offset);

        const myHalfX = this.size.x / 2;
        const myHalfY = this.size.y / 2;
        const myHalfZ = this.size.z / 2;

        const otherHalfX = other.size.x / 2;
        const otherHalfY = other.size.y / 2;
        const otherHalfZ = other.size.z / 2;

        return (
            Math.abs(myPos.x - otherPos.x) < (myHalfX + otherHalfX) &&
            Math.abs(myPos.y - otherPos.y) < (myHalfY + otherHalfY) &&
            Math.abs(myPos.z - otherPos.z) < (myHalfZ + otherHalfZ)
        );
    }
}
