import { vec2 } from 'gl-matrix';

export class Vector2 {
    private _v: vec2;

    constructor(x: number = 0, y: number = 0) {
        this._v = vec2.fromValues(x, y);
    }

    get x(): number { return this._v[0]; }
    set x(val: number) { this._v[0] = val; }

    get y(): number { return this._v[1]; }
    set y(val: number) { this._v[1] = val; }

    add(other: Vector2): Vector2 {
        const out = new Vector2();
        vec2.add(out._v, this._v, other._v);
        return out;
    }

    sub(other: Vector2): Vector2 {
        const out = new Vector2();
        vec2.sub(out._v, this._v, other._v);
        return out;
    }

    scale(s: number): Vector2 {
        const out = new Vector2();
        vec2.scale(out._v, this._v, s);
        return out;
    }

    distance(other: Vector2): number {
        return vec2.distance(this._v, other._v);
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    length(): number {
        return vec2.len(this._v);
    }

    lengthSq(): number {
        return vec2.sqrLen(this._v);
    }

    normalize(): Vector2 {
        const out = new Vector2();
        vec2.normalize(out._v, this._v);
        return out;
    }



    set(x: number, y: number): void {
        this._v[0] = x;
        this._v[1] = y;
    }

    toString(): string {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
}
