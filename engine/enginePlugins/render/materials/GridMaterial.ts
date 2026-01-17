import { color, float, fract, mix, step, uv } from 'three/tsl';
import { Material } from '../Material';

export class GridMaterial extends Material {
    constructor(
        cellColorHex: number,
        lineColorHex: number = 0xffffff,
        density: number = 10.0,
        lineThickness: number = 0.05
    ) {
        super();

        const cellColor = color(cellColorHex);
        const lineColor = color(lineColorHex);

        const st = uv().mul(density);
        const localUV = fract(st);

        const thickness = float(lineThickness);

        // Calculate lines at edges
        const start = step(thickness, localUV);
        const end = step(localUV, float(1.0).sub(thickness));

        // Combine x and y to find "center" of cell
        const isCenter = start.x.mul(start.y).mul(end.x).mul(end.y);

        // Mix line and cell color
        this.internal.colorNode = mix(lineColor, cellColor, isCenter);
    }
}
