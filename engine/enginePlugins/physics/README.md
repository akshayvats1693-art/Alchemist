# Physics Plugin

**Architectural Role**: Simulation World (Deterministic Logic)

This module provides deterministic 3D AABB physics suitable for grid-based or simple arcade games within the SwarnEngine. It operates entirely within the isolated Simulation World, updating state via the standard `tick(dt)` loop.

## Exported ARC Components

### Systems
*   **`PhysicsSystem`**
    *   **Role**: A `GameSystem` that manages the physics world.
    *   **Responsibility**:
        *   Maintains a registry of active `BoxCollisionComponent`s.
        *   Performs pairwise AABB collision checks.
        *   Resolves overlaps (separating objects) and dispatches events.
        *   Provides `raycast` functionality for logic queries.
    *   **Usage**: Automatically instantiated by the Scene if required. Actors access it via `scene.getSystem(PhysicsSystem)`.

### Components
*   **`PhysicsComponent`**
    *   **Role**: `ActorComponent` (Logic).
    *   **Responsibility**:
        *   Handles Newtonian motion (Velocity, Acceleration, Gravity).
        *   Performs **sub-stepping** integration to prevent tunneling at high speeds.
        *   Continuously checks for collisions during movement steps.
*   **`BoxCollisionComponent`**
    *   **Role**: `ActorComponent` (Data/Logic).
    *   **Responsibility**:
        *   Defines the physical extent (AABB) of an Actor.
        *   **Properties**: `size`, `offset`, `isStatic` (immovable), `isTrigger` (sensor only).
        *   Registers itself with the `PhysicsSystem` on `beginPlay`.

### Interfaces
*   **`CollisionListener`**
    *   **Role**: Logic Interface.
    *   **Usage**: Actors or Components can implement `onCollision(other, self, otherCollider)` to react to physical contacts.

## Usage

### Basic Setup
1.  Add `PhysicsComponent` to an Actor to give it motion.
2.  Add `BoxCollisionComponent` to define its shape.
3.  Ensure `PhysicsSystem` is registered in your Scene (or lazily created).

```typescript
// Example Actor Setup
class Player extends Actor {
    constructor() {
        super();
        this.addComponent(new PhysicsComponent());
        
        const collider = new BoxCollisionComponent();
        collider.size = new Vector3(40, 40, 40);
        this.addComponent(collider);
    }
}
```

### Collision Resolution
The system uses a **Satellites/Corner Smoothing** approach:
*   Objects slide along surfaces if the overlap is shallow (grazing a corner).
*   Deep overlaps are pushed out strictly along the axis of least penetration.
*   **Deterministic**: All floating point math is standard JS `number`, consistent within the deterministic simulation bubble.
