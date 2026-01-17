import { Actor } from '../../engine-core/Actor';
import { CameraComponent, type CameraConfig } from './CameraComponent';

export class CameraActor extends Actor {
    public readonly cameraComponent: CameraComponent;
    private config: CameraConfig;

    constructor(config: CameraConfig) {
        super();
        this.name = 'CameraActor';
        this.config = config;
        this.cameraComponent = new CameraComponent(config);
        this.addComponent(this.cameraComponent);
    }

    public static readonly STANDARD_WIDTH = 600;
    public static readonly STANDARD_HEIGHT = 1334;

    /**
     * Creates a camera configured for the engine standard 9:20 Portrait (600x1334).
     */
    public static createStandard(): CameraActor {
        return new CameraActor({
            width: CameraActor.STANDARD_WIDTH,
            height: CameraActor.STANDARD_HEIGHT,
            type: 'orthographic'
        });
    }

    /**
     * Creates a camera configured for the engine standard 20:9 Landscape (1334x600).
     */
    public static createStandardLandscape(): CameraActor {
        return new CameraActor({
            width: CameraActor.STANDARD_HEIGHT, // 1334
            height: CameraActor.STANDARD_WIDTH, // 600
            type: 'orthographic'
        });
    }

    public get width(): number {
        return this.cameraComponent.width;
    }

    public get height(): number {
        return this.cameraComponent.height;
    }
}
