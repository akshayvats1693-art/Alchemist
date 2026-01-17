import { Vector3 } from './Vector3';

export class Bounds {
    public min: Vector3;
    public max: Vector3;

    constructor(min: Vector3 = new Vector3(Infinity, Infinity, Infinity), max: Vector3 = new Vector3(-Infinity, -Infinity, -Infinity)) {
        this.min = min;
        this.max = max;
    }

    public static fromPoints(points: Vector3[]): Bounds {
        const min = new Vector3(Infinity, Infinity, Infinity);
        const max = new Vector3(-Infinity, -Infinity, -Infinity);

        for (const p of points) {
            min.x = Math.min(min.x, p.x);
            min.y = Math.min(min.y, p.y);
            min.z = Math.min(min.z, p.z);
            max.x = Math.max(max.x, p.x);
            max.y = Math.max(max.y, p.y);
            max.z = Math.max(max.z, p.z);
        }

        return new Bounds(min, max);
    }

    public isValid(): boolean {
        return this.min.x <= this.max.x && this.min.y <= this.max.y && this.min.z <= this.max.z;
    }

    public encapsulate(point: Vector3): void {
        this.min.x = Math.min(this.min.x, point.x);
        this.min.y = Math.min(this.min.y, point.y);
        this.min.z = Math.min(this.min.z, point.z);
        this.max.x = Math.max(this.max.x, point.x);
        this.max.y = Math.max(this.max.y, point.y);
        this.max.z = Math.max(this.max.z, point.z);
    }

    public encapsulateBounds(other: Bounds): void {
        if (!other.isValid()) { return; }
        this.encapsulate(other.min);
        this.encapsulate(other.max);
    }

    public get center(): Vector3 {
        return new Vector3(
            (this.min.x + this.max.x) * 0.5,
            (this.min.y + this.max.y) * 0.5,
            (this.min.z + this.max.z) * 0.5
        );
    }

    public get size(): Vector3 {
        return new Vector3(
            this.max.x - this.min.x,
            this.max.y - this.min.y,
            this.max.z - this.min.z
        );
    }
}
