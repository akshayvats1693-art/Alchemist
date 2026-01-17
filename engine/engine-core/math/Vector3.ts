
import { vec3 } from 'gl-matrix';

export class Vector3 {
    private _v: vec3;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this._v = vec3.fromValues(x, y, z);
    }

    get x(): number { return this._v[0]; }
    set x(val: number) { this._v[0] = val; }

    get y(): number { return this._v[1]; }
    set y(val: number) { this._v[1] = val; }

    get z(): number { return this._v[2]; }
    set z(val: number) { this._v[2] = val; }

    add(other: Vector3): Vector3 {
        const out = new Vector3();
        vec3.add(out._v, this._v, other._v);
        return out;
    }

    sub(other: Vector3): Vector3 {
        const out = new Vector3();
        vec3.sub(out._v, this._v, other._v);
        return out;
    }

    scale(s: number): Vector3 {
        const out = new Vector3();
        vec3.scale(out._v, this._v, s);
        return out;
    }

    distance(other: Vector3): number {
        return vec3.distance(this._v, other._v);
    }

    distanceSquared(other: Vector3): number {
        return vec3.sqrDist(this._v, other._v);
    }

    length(): number {
        return vec3.length(this._v);
    }

    normalize(): Vector3 {
        const out = new Vector3();
        vec3.normalize(out._v, this._v);
        return out;
    }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    set(x: number, y: number, z: number): void {
        vec3.set(this._v, x, y, z);
    }

    toString(): string {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
    }
}
