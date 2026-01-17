import { EngineContext } from '../../engine-core/EngineContext';

export class RenderContext extends EngineContext {
    public canvas: HTMLCanvasElement | null;

    constructor(
        canvas: HTMLCanvasElement | null
    ) {
        super();
        this.canvas = canvas;
    }
}
