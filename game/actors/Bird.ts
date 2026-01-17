import { Actor, PhysicsComponent, BoxCollisionComponent, BoxRenderer, Vector3, CollisionListener } from '@swarnos/engine';

export class Bird extends Actor implements CollisionListener {
    public physics: PhysicsComponent;
    public isDead: boolean = false;

    constructor() {
        super();
        this.name = 'Bird';
        
        // Add Renderer
        this.addComponent(new BoxRenderer(40, 40, 0xffff00));
        
        // Add Physics
        this.physics = new PhysicsComponent();
        this.physics.gravityScale = 1.0;
        this.addComponent(this.physics);
        
        // Add Collision
        const collider = new BoxCollisionComponent();
        collider.size = new Vector3(30, 30, 10); // Slightly smaller collision box for fairness
        this.addComponent(collider);
    }

    public flap(): void {
        if (this.isDead) return;
        this.physics.velocity.y = 500; // Jump strength
    }

    public override tick(dt: number): void {
        super.tick(dt);
        
        if (!this.isDead) {
            // Tilt bird based on velocity
            const targetRotation = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, this.physics.velocity.y * 0.002));
            this.transform.rotation.z = targetRotation;
        }

        // Simple death check if out of bounds
        if (this.transform.position.y < -650 || this.transform.position.y > 650) {
            this.die();
        }
    }

    public onCollision(other: Actor): void {
        if (other.name === 'Pipe' || other.name === 'Ground') {
            this.die();
        }
    }

    public die(): void {
        if (this.isDead) return;
        this.isDead = true;
        this.physics.velocity.y = -200; // Small bounce on death
        this.physics.gravityScale = 2.0; // Fall faster
        // Change color to indicate death
        const renderer = this.getComponent(BoxRenderer);
        if (renderer) {
            // We can't easily change color of material once created in this engine version 
            // without knowing the material structure, but let's assume we can replace it.
            // Actually, let's just stick to the current state for now.
        }
    }
}
