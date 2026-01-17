import { color, float, floor, fract, mix, step, uv, vec2 } from 'three/tsl';
import { Material } from '../Material';

export class StaggeredTileMaterial extends Material {
    constructor(
        tileColorHex: number,
        gapColorHex: number = 0xCCCCCC,
        densityX: number = 3.0,
        densityY: number = 6.0,
        gapThickness: number = 0.08
    ) {
        super();

        const tileColor = color(tileColorHex);
        const gapColor = color(gapColorHex);

        // Density of tiles.
        const density = vec2(densityX, densityY);
        const st = uv().mul(density);

        // Identify row index to stagger every other row.
        const row = floor(st.y);
        // Modulo 2 to see if odd or even row.
        const isOddRow = row.mod(2.0).greaterThan(0.5);

        // Shift X by 0.5 if odd row.
        const offset = mix(float(0.0), float(0.5), float(isOddRow));
        const stX = st.x.add(offset);

        // Compute local UV within the tile cell.
        // Fract gives 0..1 in each cell.
        const localUV = vec2(fract(stX), fract(st.y));

        const thickness = float(gapThickness);

        // Use step to create hard edges for tiles.
        // We want areas where localUV is between (thick, thick) and (1-thick, 1-thick).
        const start = step(thickness, localUV);
        const end = step(localUV, float(1.0).sub(thickness));

        // Combine x and y.
        const isTile = start.x.mul(start.y).mul(end.x).mul(end.y);

        // Mix gap and tile color.
        this.internal.colorNode = mix(gapColor, tileColor, isTile);
    }
}
