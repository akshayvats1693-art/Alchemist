// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { Scene } from '../../engine-core/Scene';
import { PlaytestSandbox } from '../testing';
import { CameraActor } from './CameraActor';
import { RenderContext } from './RenderContext';
import { RenderSystem } from './RenderSystem';

vi.mock('./RenderBackend', () => {
    return {
        RenderBackend: class {
            public initialize = vi.fn().mockResolvedValue(undefined);
            public render = vi.fn();
            public dispose = vi.fn();
            public get internal() { return {}; }
        }
    };
});

class TestScene extends Scene {
    constructor() {
        super();
        const renderSystem = new RenderSystem();
        this.addSystem(renderSystem);

        const cameraActor = new CameraActor({
            type: 'orthographic',
            width: 2000,
            height: 900
        });
        cameraActor.transform.position.set(0, 0, 100);
        this.addActor(cameraActor);
        renderSystem.setMainCamera(cameraActor.cameraComponent);
    }
}

describe('RenderSystem', () => {
    it('should map screen coordinates to world coordinates correctly (Y-Up)', () => {
        // Provide Mock Canvas via RenderContext
        const mockCanvas = document.createElement('canvas');
        mockCanvas.width = 2000;
        mockCanvas.height = 900;
        /**
         * Mock getBoundingClientRect.
         */
        mockCanvas.getBoundingClientRect = () => ({
            width: 2000,
            height: 900,
            top: 0,
            left: 0,
            right: 2000,
            bottom: 900,
            x: 0,
            y: 0,
            toJSON: () => { }
        });

        const sandbox = new PlaytestSandbox(TestScene, 12345, [new RenderContext(mockCanvas)]);
        sandbox.step(0.016); // Run one frame to ensure camera initialization
        const scene = sandbox.scene as TestScene;
        const renderSystem = scene.getSystem(RenderSystem);

        expect(renderSystem).toBeDefined();

        // 2000x900 Screen
        // Center (1000, 450) -> World (0, 0)
        let ray = renderSystem!.getRayFromScreenCoords(1000, 450);
        expect(ray.origin.x).toBeCloseTo(0);
        expect(ray.origin.y).toBeCloseTo(0);

        // Top-Left (0, 0)
        // With Y-Up (Standard ThreeJS / Rendering)
        // Screen Y=0 -> World Y=+450 (Top)
        // Screen X=0 -> World X=-1000 (Left)
        ray = renderSystem!.getRayFromScreenCoords(0, 0);
        expect(ray.origin.x).toBeCloseTo(-1000);
        expect(ray.origin.y).toBeCloseTo(450);

        // Bottom-Right (2000, 900)
        // Screen Y=900 -> World Y=-450 (Bottom)
        // Screen X=2000 -> World X=1000 (Right)
        ray = renderSystem!.getRayFromScreenCoords(2000, 900);
        expect(ray.origin.x).toBeCloseTo(1000);
        expect(ray.origin.y).toBeCloseTo(-450);
    });
});
