
import { Actor } from '@swarnos/engine';
import { BoxRenderer } from '@swarnos/engine';

export class BoxActor extends Actor {
    private _rotationSpeed: number;

    constructor(x: number, y: number, width: number, height: number, color: number, rotationSpeed: number = 0, opacity: number = 1.0) {
        super();
        this.addComponent(new BoxRenderer(width, height, color, opacity));
        this.transform.position.set(x, y, 0);
        this._rotationSpeed = rotationSpeed;
    }

    protected override tick(dt: number): void {
        super.tick(dt);
        if (this._rotationSpeed !== 0) {
            this.transform.rotation.z += this._rotationSpeed * dt;
        }
    }
}
