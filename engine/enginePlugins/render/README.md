# Render Plugin

**Architectural Role**: Simulation World (Visual Sync) & External Output

This module manages the visual representation of the game. It bridges the deterministic Simulation World (Actors/Transforms) with the External World's rendering context (Canvas/WebGPU/Three.js).

## Exported ARC Components

### Systems
*   **`RenderSystem`**
    *   **Role**: `GameSystem` (Manager).
    *   **Responsibility**:
        *   Initializes the `RenderBackend` (WebGPU) using the `RenderContext` provided by the Platform `Frame`.
        *   Manages the Three.js `Scene` graph.
        *   Handles window resizing via `ResizeObserver` and updates the renderer.
        *   **Tick**: Syncs scene matrices and issues the draw call (`_backend.render`) at the end of the frame.
    *   **Raycasting**: Provides `getRayFromScreenCoords` to translate screen X/Y (External) into world space rays (Simulation), essential for `Click-to-Move` or selection logic.

### Components
*   **`RenderComponent`**
    *   **Role**: `ActorComponent` (Visual Sync).
    *   **Responsibility**:
        *   Creates and manages a Three.js `Mesh`.
        *   **Sync**: On `tick(dt)`, it copies the Actor's `Transform` (Position, Rotation, Scale) to the Three.js mesh.
        *   **Config**: Supports basic primitives (`box`, `sphere`, `plane`) and custom `Material`s.
*   **`CameraComponent`**
    *   **Role**: `ActorComponent` (Logic/View).
    *   **Responsibility**:
        *   Wraps a Three.js Camera (`OrthographicCamera` or `PerspectiveCamera`).
        *   Syncs the camera's position/rotation with the Actor's transform.
        *   Enforces engine standard aspect ratios (9:20 Portrait or 20:9 Landscape).

### Actors
*   **`CameraActor`**
    *   **Role**: `Actor` (Prefab).
    *   **Usage**: A convenience Actor that comes pre-configured with a `CameraComponent`.
    *   **Factories**:
        *   `createStandard()`: 600x1334 (Portrait).
        *   `createStandardLandscape()`: 1334x600 (Landscape).

### Low-Level
*   **`RenderBackend`**
    *   **Role**: External World Proxy.
    *   **Responsibility**: Wraps the raw `WebGPURenderer` implementation, isolating the engine from specific Three.js/WebGPU bootstrapping logic.

## Usage

### Basic Setup
1.  **Camera**: You MUST have a `CameraActor` in the scene for anything to render.
2.  **Visuals**: add `RenderComponent` to actors you want to see.

```typescript
// 1. Setup Camera in your Scene
class MyLevel extends Scene {
    public override beginPlay(): void {
        super.beginPlay();
        
        // Mobile-first Portrait Camera
        const cam = CameraActor.createStandard();
        this.addActor(cam);
        
        // Notify RenderSystem
        this.getSystem(RenderSystem)?.setMainCamera(cam.cameraComponent);
        
        // 2. Add an Object
        const cube = new Actor();
        cube.addComponent(new RenderComponent({ 
            type: 'box', 
            size: [40, 40, 40] 
        }, new Material({ color: 0xff0000 })));
        
        this.addActor(cube);
    }
}
```

### Coordinate System
The engine uses **Resolution Independence**.
*   **Logic Coordinates**: Fixed grid (e.g., 600 units wide).
*   **Device Pixels**: The renderer scales the view to fit the physical screen, but the logic coordinates remain constant.
*   **Raycasting**: `RenderSystem.getRayFromScreenCoords` automatically handles the translation from DOM MouseEvent coordinates to World Logic coordinates.
