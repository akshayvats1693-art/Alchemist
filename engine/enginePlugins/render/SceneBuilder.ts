
import * as THREE from 'three';
import { RenderConstants } from './RenderConstants';

export class SceneBuilder {
    public static createDefaultScene(): THREE.Scene {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(RenderConstants.CANVAS.BACKGROUND_COLOR);
        return scene;
    }

    public static setupDefaultLights(scene: THREE.Scene): void {
        const { DIRECTIONAL, AMBIENT } = RenderConstants.LIGHTING;

        const dirLight = new THREE.DirectionalLight(DIRECTIONAL.COLOR, DIRECTIONAL.INTENSITY);
        dirLight.position.copy(DIRECTIONAL.POSITION);
        scene.add(dirLight);

        scene.add(new THREE.AmbientLight(AMBIENT.COLOR));
    }

    public static createDefaultCamera(width: number, height: number): THREE.OrthographicCamera {
        const { NEAR, FAR } = RenderConstants.CAMERA.DEFAULT;
        return new THREE.OrthographicCamera(
            -width / 2, width / 2,
            height / 2, -height / 2,
            NEAR, FAR
        );
    }
}
