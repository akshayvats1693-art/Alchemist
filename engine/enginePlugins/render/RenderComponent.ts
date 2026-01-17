import * as THREE from 'three';
import { ActorComponent } from '../../engine-core/ActorComponent';
import { Bounds } from '../../engine-core/math/Bounds';
import { Vector3 } from '../../engine-core/math/Vector3';
import { Material } from './Material';
import { RenderConstants } from './RenderConstants';
import { RenderSystem } from './RenderSystem';

export class RenderComponent extends ActorComponent {
    public geometryConfig: { type: 'box' | 'plane' | 'sphere', size?: number[] } = { type: 'plane' };

    public bounds: Vector3 = new Vector3(
        RenderConstants.GEOMETRY.DEFAULT_BOUNDS.x,
        RenderConstants.GEOMETRY.DEFAULT_BOUNDS.y,
        RenderConstants.GEOMETRY.DEFAULT_BOUNDS.z
    );
    public offset: Vector3 = new Vector3(0, 0, 0);
    public material: Material | null = null;

    protected _mesh: THREE.Mesh | null = null;
    private _sceneGraph: THREE.Scene | null = null;

    public get mesh(): THREE.Mesh | null {
        return this._mesh;
    }

    public override getBounds(): Bounds {
        const { position, scale } = this.actor.transform;

        // Simple AABB assuming no rotation for now. 
        // Ideal: Construct 8 corners, rotate them, then find min/max.
        const halfX = (this.bounds.x * scale.x) / 2;
        const halfY = (this.bounds.y * scale.y) / 2;
        const halfZ = (this.bounds.z * scale.z) / 2;

        // Position + Offset
        const cx = position.x + this.offset.x;
        const cy = position.y + this.offset.y;
        const cz = position.z + this.offset.z;

        const min = new Vector3(cx - halfX, cy - halfY, cz - halfZ);
        const max = new Vector3(cx + halfX, cy + halfY, cz + halfZ);

        return new Bounds(min, max);
    }

    constructor(
        config?: { type: 'box' | 'plane' | 'sphere', size?: number[] },
        material?: Material
    ) {
        super();
        if (config) {
            this.geometryConfig = config;
            if (Array.isArray(config.size) && config.size.length >= 2) {
                this.bounds.x = config.size[0];
                this.bounds.y = config.size[1];
                if (config.size.length > 2) {
                    this.bounds.z = config.size[2];
                }
            }
        }
        if (material) {
            this.material = material;
        }
    }

    public beginPlay(): void {
        super.beginPlay();

        const renderSys = this.actor.scene?.getSystem(RenderSystem);
        if (!renderSys) {
            return;
        }

        try {
            this._sceneGraph = renderSys.sceneGraph;
        } catch {
            // Headless mode or RenderSystem not initialized
            return;
        }

        if (this.material) {
            this.material.beginPlay();
        }
        this.createMesh();

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._mesh && this._sceneGraph) {
            this._sceneGraph.add(this._mesh);
            this.syncMeshTransforms();
        }
    }

    protected createMesh(): void {
        if (!this.material) {
            throw new Error(`RenderComponent on ${this.actor.name} has no material assigned.`);
        }

        let geometry: THREE.BufferGeometry;

        if (this.geometryConfig.type === 'box') {
            geometry = new THREE.BoxGeometry(this.bounds.x, this.bounds.y, this.bounds.z);
        } else if (this.geometryConfig.type === 'sphere') {
            const { WIDTH_SEGMENTS, HEIGHT_SEGMENTS } = RenderConstants.GEOMETRY.SPHERE;
            // Using x as radius, y/z ignored/defaulted
            geometry = new THREE.SphereGeometry(this.bounds.x / 2, WIDTH_SEGMENTS, HEIGHT_SEGMENTS);
        } else {
            geometry = new THREE.PlaneGeometry(this.bounds.x, this.bounds.y);
        }

        // Ensure double side for planes, optional for boxes but harmless
        this.material.internal.side = THREE.DoubleSide;
        this._mesh = new THREE.Mesh(geometry, this.material.internal);
    }

    public override render(dt: number): void {
        if (this.material) {
            this.material.tick(dt);
        }
        this.syncMeshTransforms();
    }

    public localScale: Vector3 = new Vector3(1, 1, 1);

    protected syncMeshTransforms(): void {
        if (!this._mesh) {
            return;
        }

        const { transform } = this.actor;
        // Full 3D sync
        this._mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
        this._mesh.position.x += this.offset.x;
        this._mesh.position.y += this.offset.y;
        this._mesh.position.z += this.offset.z;

        // Sync rotation (Euler)
        this._mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);

        // Sync scale
        this._mesh.scale.set(
            transform.scale.x * this.localScale.x,
            transform.scale.y * this.localScale.y,
            transform.scale.z * this.localScale.z
        );
    }

    public endPlay(): void {
        if (this._mesh) {
            if (this._sceneGraph) {
                this._sceneGraph.remove(this._mesh);
            }

            this._mesh.geometry.dispose();

            if (this._mesh.material instanceof THREE.Material) {
                this._mesh.material.dispose();
            } else if (Array.isArray(this._mesh.material)) {
                this._mesh.material.forEach(m => { m.dispose(); });
            }
            this._mesh = null;
        }
        this._sceneGraph = null;
        super.endPlay();
    }
}
