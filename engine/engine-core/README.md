# @swarnos/engine-core

## Architectural Role
**The Deterministic Kernel.**

This directory contains the core logic that powers the **Simulation World** of SwarnEngine. It implements the strict separation between the host platform (External World) and the game logic (Game World) defined in [Core Architecture](../../../knowledge/arc.md).

The specific responsibilities of this module are:
1.  **Orchestration**: `GameEngine` runs the simulation loop.
2.  **State Management**: `Scene` holds the mutable game state.
3.  **Entity Logic**: `Actor` and `GameSystem` define the behavior.
4.  **Boundary Definition**: `FrameInput` defines the *only* data allowed to enter the simulation for a given tick.

---

## Key Components

### 1. The Kernel (`src/engine-core/GameEngine.ts`)
*Role: Simulation World*
The `GameEngine` is the heart of the system. It:
-   Maintains the active `Scene`.
-   Consumes `FrameInput` from the platform.
-   Advances the simulation by calling `tick()` on the Scene.
-   **Crucially**: It enforces the barrier. It does not allow direct access to DOM or Hardware from within the loop.

### 2. The Boundary (`src/engine-core/FrameInput.ts`)
*Role: Boundary / Input Protocol*
`FrameInput` is the immutable data structure representing a single "tick" of time. It contains:
-   `dt`: Delta time.
-   `devices`: A list of `DeviceBucket`s containing raw input signals (e.g., from `ActionAdaptor`s).

### 3. Simulation Entities (`src/engine-core/Scene.ts`, `Actor.ts`)
*Role: Simulation World*
-   **`Scene`**: The container for all game state. It owns Actors and Systems.
-   **`Actor`**: An entity within the game world. Can have `ActorComponent`s attached.
-   **`GameSystem`**: Global logic that operates on the scene (e.g., `PhysicsSystem`, `AiSystem`).

### 4. Sub-Modules
-   **[Action](./action/README.md)**: Input handling mechanisms (`ActionAdaptor`, `ActionBinder`) that map raw device signals to semantic game actions.
-   **[Bridge](./bridge/README.md)**: Safe control mechanisms (`IGameBridge`) allowing the External World (UI) to command the Simulation World (e.g., "Pause", "Load Level").
-   **[Insights](./insights/README.md)**: Telemetry and debugging instrumentation (`EngineInstrumentation`).
-   **[Math](./math/README.md)**: Deterministic math primitives (`Vector2`, `DeterministicRng`).

---

## Usage Example

### Defining a Game Scene
```typescript
import { Scene, Actor, GameSystem } from '@swarnos/engine-core';

class MyGameScene extends Scene {
    constructor() {
        super();
        this.addSystem(new PhysicsSystem());
        this.addActor(new PlayerActor());
    }
}
```

### Running the Engine (Platform Layer)
*Note: This usually happens in the `platform` module, but conceptually:*

```typescript
// 1. Initialize Engine
const engine = new GameEngine(contexts);

// 2. Set the Scene
engine.setScene(() => new MyGameScene());

// 3. Drive the Loop (e.g., in requestAnimationFrame)
function gameLoop(dt: number) {
    const input = constructFrameInput(dt); // Collect inputs from ActionAdaptors
    engine.tick(input);                    // Advance simulation
}
```
