import { Material } from './Material';
import { RenderComponent } from './RenderComponent';

class BoxInternalMaterial extends Material {
    constructor(color: number, opacity: number) {
        super({
            color,
            opacity,
            transparent: opacity < 1.0
        });
    }
}

export class BoxRenderer extends RenderComponent {
    constructor(
        width: number,
        height: number,
        colorOrMaterial: number | Material,
        opacity: number = 1.0
    ) {
        super();
        this.bounds.x = width;
        this.bounds.y = height;

        if (typeof colorOrMaterial === 'number') {
            this.material = new BoxInternalMaterial(colorOrMaterial, opacity);
        } else {
            this.material = colorOrMaterial;
        }
    }
}
