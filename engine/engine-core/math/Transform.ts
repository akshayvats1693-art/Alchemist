import { Vector3 } from './Vector3';

export class Transform {
    public position: Vector3;
    /**
     * Euler angles (degrees? Radians? Usually radians in math, degrees in Unreal UI).
     */
    public rotation: Vector3 = new Vector3(0, 0, 0); 
    public scale: Vector3 = new Vector3(1, 1, 1);

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.position = new Vector3(x, y, z);
    }
}
