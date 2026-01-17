
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu'; // Adjust import based on actual shim/availability if needed, but per previous file this works.

export class RenderBackend {
    private _renderer: WebGPURenderer | null = null;
    private _canvas: HTMLCanvasElement | null = null;

    public get internal(): WebGPURenderer {
        if (!this._renderer) {
            throw new Error('RenderBackend: Renderer not initialized');
        }
        return this._renderer;
    }

    public async initialize(canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
        this._canvas = canvas;
        try {
            const renderer = new WebGPURenderer({
                canvas: this._canvas,
                antialias: true
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(width, height, false); // false = do not update style.width/height, let CSS handle it

            await renderer.init();
            this._renderer = renderer;
        } catch (error) {
            throw new Error(`RenderBackend: WebGPU Init Failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public setSize(width: number, height: number): void {
        this._renderer?.setSize(width, height, false);
    }

    public render(scene: THREE.Scene, camera: THREE.Camera): void {
        if (!this._renderer) {
            return;
        }
        this._renderer.render(scene, camera);
    }

    public dispose(): void {
        if (!this._renderer) {
            return;
        }
        this._renderer.dispose();
        this._renderer = null;
    }
}
