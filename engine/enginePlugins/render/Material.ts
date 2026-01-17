import * as THREE from 'three';
import { MeshStandardNodeMaterial } from 'three/webgpu';

export class Material {
    protected material: MeshStandardNodeMaterial;

    constructor(parameters?: THREE.MeshStandardMaterialParameters) {
        this.material = new MeshStandardNodeMaterial(parameters);
    }

    public get internal(): MeshStandardNodeMaterial {
        return this.material;
    }

    public beginPlay(): void {
        // Override to load resources or setup material
    }

    public tick(dt: number): void {
        // Override to update material uniforms/nodes
    }
}
