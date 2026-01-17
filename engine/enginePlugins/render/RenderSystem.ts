import * as THREE from 'three';
import { GameSystem } from '../../engine-core/GameSystem';
import { Vector3 } from '../../engine-core/math/Vector3';
import { CameraComponent } from './CameraComponent';
import { RenderBackend } from './RenderBackend';
import { RenderContext } from './RenderContext';
import { SceneBuilder } from './SceneBuilder';

export class RenderSystem extends GameSystem {
    private _backend: RenderBackend = new RenderBackend();
    private _sceneGraph: THREE.Scene | null = null;

    /** Default fallback camera. */
    private _defaultCamera: THREE.Camera | null = null;

    /** Active game camera. */
    private _mainCamera: CameraComponent | null = null;

    private _canvas: HTMLCanvasElement | null = null;
    private _isInitialized = false;

    public setMainCamera(camera: CameraComponent): void {
        this._mainCamera = camera;
    }

    /**
     * Exposed for low-level access if absolutely needed (e.g. Materials).
     */
    public get renderer() {
        return this._backend.internal;
    }

    public get sceneGraph(): THREE.Scene {
        if (!this._sceneGraph) {
            throw new Error('Scene not initialized');
        }
        return this._sceneGraph;
    }

    public get camera(): THREE.Camera {
        if (this._mainCamera) {
            return this._mainCamera._internalCamera;
        }
        if (!this._defaultCamera) {
            throw new Error('Camera not initialized');
        }
        return this._defaultCamera;
    }

    public override beginPlay(): void {
        super.beginPlay();

        const context = this.scene.getEngineContext(RenderContext);
        if (!context) {
            console.warn('RenderSystem: No RenderContext found. Running in headless mode.');
            return;
        }

        this._canvas = context.canvas;
        this.initialize(context).catch(error => {
            console.error('RenderSystem: Initialization failed', error);
        });
    }

    private async initialize(context: RenderContext): Promise<void> {
        if (!this._canvas) {
            throw new Error('RenderSystem: No canvas');
        }

        const rect = this._canvas.getBoundingClientRect();

        // 1. Build Scene
        this._sceneGraph = SceneBuilder.createDefaultScene();
        SceneBuilder.setupDefaultLights(this._sceneGraph);
        this._defaultCamera = SceneBuilder.createDefaultCamera(rect.width, rect.height);

        // 2. Init Backend
        await this._backend.initialize(this._canvas, rect.width, rect.height);

        // 3. Setup Observer
        // 3. Setup Observer
        const observer = new ResizeObserver((entries) => {
            // Wrap in RAF to avoid "ResizeObserver loop completed with undelivered notifications"
            window.requestAnimationFrame(() => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width === 0 || height === 0) { continue; }

                    // Prevent redundant resizing
                    if (Math.abs(width - this._lastWidth) < 1 && Math.abs(height - this._lastHeight) < 1) {
                        continue;
                    }

                    this._lastWidth = width;
                    this._lastHeight = height;

                    this._backend.setSize(width, height);
                }
            });
        });
        observer.observe(this._canvas);
        this._resizeObserver = observer;

        this._isInitialized = true;
    }

    private _resizeObserver: ResizeObserver | null = null;
    private _lastWidth = 0;
    private _lastHeight = 0;

    public get resolution(): { width: number; height: number } {
        return { width: this._lastWidth, height: this._lastHeight };
    }


    public tick(dt: number): void {
        // Core responsibility: Sync Matrices & Render
        if (this._sceneGraph) {
            this._sceneGraph.updateMatrixWorld(true);
            try {
                this.camera.updateMatrixWorld(true);
            } catch { /* ignore */ }
        }

        if (this._isInitialized && this._sceneGraph) {
            try {
                this._backend.render(this._sceneGraph, this.camera);
            } catch (error) {
                console.warn('RenderSystem: Render failed', error);
            }
        }
    }

    public endPlay(): void {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        this._backend.dispose();
        this._sceneGraph = null;
        this._defaultCamera = null;
        super.endPlay();
    }

    private _raycaster = new THREE.Raycaster();

    public getRayFromScreenCoords(screenX: number, screenY: number): { origin: Vector3; direction: Vector3 } {
        if (!this._canvas) {
            throw new Error('RenderSystem: No canvas found');
        }

        // Ensure camera matrix is up to date
        try {
            this.camera.updateMatrixWorld();
        } catch { /* ignore */ }

        const rect = this._canvas.getBoundingClientRect();
        // Normalized Device Coordinates (NDC)
        const x = (screenX / rect.width) * 2 - 1;
        const y = -(screenY / rect.height) * 2 + 1;

        this._raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

        return {
            origin: new Vector3(this._raycaster.ray.origin.x, this._raycaster.ray.origin.y, this._raycaster.ray.origin.z),
            direction: new Vector3(this._raycaster.ray.direction.x, this._raycaster.ray.direction.y, this._raycaster.ray.direction.z)
        };
    }
}
