
import * as THREE from 'three';

export const RenderConstants = {
    CANVAS: {
        BACKGROUND_COLOR: 0x202020,
    },
    LIGHTING: {
        DIRECTIONAL: {
            COLOR: 0xffffff,
            INTENSITY: 1,
            POSITION: new THREE.Vector3(10, 10, 10),
        },
        AMBIENT: {
            COLOR: 0x909090,
            INTENSITY: 1, // Default ThreeJS ambient intensity is usually 1 if not specified, but good to be explicit or leave as color-only if checking docs. AmbientLight constructor takes color and intensity.
        },
    },
    CAMERA: {
        DEFAULT: {
            NEAR: 0.1,
            FAR: 1000,
            Z_POSITION: 100,
            FOV: 75,
            WIDTH: 800,
            HEIGHT: 600,
        },
        ASPECT_RATIO: {
            LANDSCAPE: 20 / 9,
            PORTRAIT: 9 / 20,
            EPSILON: 0.01,
        },
    },
    GEOMETRY: {
        SPHERE: {
            WIDTH_SEGMENTS: 16,
            HEIGHT_SEGMENTS: 16,
        },
        DEFAULT_BOUNDS: new THREE.Vector3(20, 20, 20),
    },
} as const;
