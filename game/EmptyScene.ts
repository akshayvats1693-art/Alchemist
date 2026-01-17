
import { Scene } from '@swarnos/engine';
import { CameraActor } from '@swarnos/engine';
import { RenderSystem } from '@swarnos/engine';
import { BoxActor } from './actors/BoxActor';
import { FActor } from './actors/FActor';

export class EmptyScene extends Scene {
    constructor() {
        super();

        // 1. Systems
        const renderSystem = new RenderSystem();
        this.addSystem(renderSystem);

        // 2. Camera
        // Coordinate System: Cartesian (Y-Up)
        // Origin (0,0) is at the center of the screen.
        // X+: Right, X-: Left
        // Y+: Up,    Y-: Down

        // Standard HD Portrait (9:20)
        const cameraActor = CameraActor.createStandard();
        cameraActor.transform.position.set(0, 0, 100);
        this.addActor(cameraActor);
        renderSystem.setMainCamera(cameraActor.cameraComponent);

        // Example: Physics System
        // const physicsSystem = new PhysicsSystem();
        // physicsSystem.gravity = new Vector3(0, -800, 0); // Negative Y pulls down in this Y-Up system
        // this.addSystem(physicsSystem);

        // 3. Actors
        // "F" symbol at the center
        this.addActor(new FActor(0, 0));

        // Rotating red box at some distance above
        this.addActor(new BoxActor(0, 150, 50, 50, 0xff0000, 1.0));

        // Blue box on the right
        this.addActor(new BoxActor(200, 0, 50, 50, 0x0000ff, 0));

        // Box that just covers the screen.
        this.addActor(new BoxActor(0, 0, 580, 1234, 0x00ffff, 0, 0.2));
    }
}
