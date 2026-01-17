import { Actor, BoxCollisionComponent, BoxRenderer, Vector3 } from '@swarnos/engine';

export class Pipe extends Actor {
    public speed: number = 250;
    public passed: boolean = false;

    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.name = 'Pipe';
        this.transform.position.set(x, y, 0);

        // Renderer
        this.addComponent(new BoxRenderer(width, height, 0x228B22)); // Forest Green

        // Collision
        const collider = new BoxCollisionComponent();
        collider.size = new Vector3(width, height, 10);
        collider.isStatic = true;
        this.addComponent(collider);
    }

    public override tick(dt: number): void {
        super.tick(dt);
        this.transform.position.x -= this.speed * dt;

        // Destroy if off screen
        if (this.transform.position.x < -600) {
            this.destroy();
        }
    }
}
