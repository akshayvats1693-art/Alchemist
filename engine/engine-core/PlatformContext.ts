
import { EngineContext } from './EngineContext';

/**
 * Provides access to platform-specific elements like the main canvas and overlay container.
 */
export class PlatformContext extends EngineContext {
    public canvas: HTMLCanvasElement;
    public overlay: HTMLDivElement | null;

    constructor(
        canvas: HTMLCanvasElement,
        overlay: HTMLDivElement | null
    ) {
        super();
        this.canvas = canvas;
        this.overlay = overlay;
    }
}
