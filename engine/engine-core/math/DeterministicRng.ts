
/**
 * A fast, deterministic pseudo-random number generator (Mulberry32).
 */
export class DeterministicRng {
    private _firstCall: boolean = true;
    private _seed: number;

    constructor(seed: number) {
        this._seed = seed;
    }

    /**
     * Returns a pseudorandom number between 0 (inclusive) and 1 (exclusive).
     */
    public next(): number {
        this._seed += 0x6D2B79F5;
        let t = this._seed;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        t = ((t ^ t >>> 14) >>> 0) / 4294967296;

        return t;
    }
}
