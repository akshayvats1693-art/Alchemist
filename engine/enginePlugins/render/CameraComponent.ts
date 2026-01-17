import * as THREE from 'three';
import { ActorComponent } from '../../engine-core/ActorComponent';
import { RenderConstants } from './RenderConstants';

export interface CameraConfig {
    type: 'perspective' | 'orthographic';
    /**
     * Perspective.
     */
    fov?: number;
    aspect?: number;
    width?: number;
    height?: number;
    near?: number;
    far?: number;
    noAutoSize?: boolean;
}

export class CameraComponent extends ActorComponent {
    private _camera: THREE.Camera | null = null;
    private config: CameraConfig;

    constructor(config: CameraConfig) {
        super();
        this.config = config;
    }

    public override beginPlay(): void {
        super.beginPlay();

        const { DEFAULT, ASPECT_RATIO } = RenderConstants.CAMERA;

        if (this.config.type === 'orthographic') {
            const height = this.config.height || DEFAULT.HEIGHT;
            const width = this.config.width || DEFAULT.WIDTH;

            const aspect = width / height;

            if (
                Math.abs(aspect - ASPECT_RATIO.LANDSCAPE) > ASPECT_RATIO.EPSILON &&
                Math.abs(aspect - ASPECT_RATIO.PORTRAIT) > ASPECT_RATIO.EPSILON
            ) {
                console.error(`Invalid Camera Aspect Ratio details: width=${String(width)}, height=${String(height)}, aspect=${String(aspect)}, LANDSCAPE=${String(ASPECT_RATIO.LANDSCAPE)}, PORTRAIT=${String(ASPECT_RATIO.PORTRAIT)}`);
                throw new Error(`Invalid Camera Aspect Ratio: ${aspect.toFixed(2)}. Standard Aspect Ratio (20:9 or 9:20) is required for this engine.`);
            }

            this._camera = new THREE.OrthographicCamera(
                -width / 2, width / 2,
                height / 2, -height / 2,
                this.config.near || DEFAULT.NEAR,
                this.config.far || DEFAULT.FAR
            );
            this._camera.position.z = DEFAULT.Z_POSITION;
        } else {
            this._camera = new THREE.PerspectiveCamera(
                this.config.fov || DEFAULT.FOV,
                this.config.aspect || 1,
                this.config.near || DEFAULT.NEAR,
                this.config.far || DEFAULT.FAR
            );
        }
    }

    public get _internalCamera(): THREE.Camera {
        return this.camera;
    }

    public get camera(): THREE.Camera {
        if (!this._camera) {
            throw new Error('CameraComponent not initialized');
        }
        return this._camera;
    }

    public get width(): number {
        if (this._camera instanceof THREE.OrthographicCamera) {
            return (this._camera.right - this._camera.left) / this._camera.zoom;
        }
        // For perspective, we default to 0 as it's depth-dependent
        return 0;
    }

    public get height(): number {
        if (this._camera instanceof THREE.OrthographicCamera) {
            return (this._camera.top - this._camera.bottom) / this._camera.zoom;
        }
        return 0;
    }

    public override tick(dt: number): void {
        if (!this._camera) {
            return;
        }
        const t = this.actor.transform;
        this._camera.position.set(t.position.x, t.position.y, t.position.z);
        this._camera.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
    }
}
