# Action System

The `action` module manages the flow of inputs across the simulation boundary, decoupling raw External World events from the deterministic Game World.

## Role in the Simulation

In SwarnEngine's simulation architecture, the Game World cannot directly access hardware or the DOM. The `action` module bridges this gap:

1.  **External World**: `ActionAdaptor`s capture raw signals (OS events, UI cliques) and normalize them.
2.  **The Boundary**: These signals are baked into `FrameInput`.
3.  **Game World**: `ActionBinder`s read from `FrameInput` to drive gameplay logic.

## Key Components

### `ActionAdaptor` (External World)
An abstract base class for `EditorSystems` that acts as an input source.
-   **Responsibility**: Converts raw events (e.g., `keydown`, `touchstart`, React button clicks) into engine-compatible signals.
-   **Output**: Injects data into the `FrameInput` stream before the simulation step.

### `ActionBinder` (Game World)
A helper class for `Actors` and `GameSystems` to consume input.
-   **Responsibility**: Queries the `FrameInput` for specific device signals (e.g., "Player 1's Controller").
-   **Operation**: It provides a semantic API (e.g., `getAxis('MoveX')`, `isPressed('Jump')`) rather than raw key checks.

### `UIAdaptor`
A specialized bridge for React-driven interactions.
-   Allows the UI (External World) to trigger actions in the engine.
-   Provides hooks like `useGameSystem` to safely observe engine state from React.
