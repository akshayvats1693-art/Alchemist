# Engine Bridge: The Safety Layer

The `bridge` module defines the **Safety Layer** that allows the External World (Editor, React UI) to interact with the Simulation Engine.

## The problem
The Simulation Engine (Scene) can be destroyed and recreated at any time (e.g., loading a level). If External systems hold direct references to Actors or the Scene, they will crash or cause memory leaks when those references become stale.

## The Solution: Scoped Access

### `IGameBridge`
The contract. It defines the *safe* operations available to the External World:
-   **Context Access**: Retrieve `EngineContexts` (Audio, Platform).
-   **System Access**: Retrieve persistent `GameSystems` (like `RenderSystem`).
-   **Commands**: `pause()`, `loadScene()`.

### `ScopedGameBridge`
The firewall.
-   **Lifecycle**: Created for a specific `Scene` instance.
-   **Revocation**: When the `Scene` is destroyed, the `ScopedGameBridge` is "revoked".
-   **Safety**: Any subsequent calls to a revoked bridge will throw a clear error or safely no-op, rather than crashing the engine or modifying dead memory.

## Usage
`EditorSystem`s and `UIAdaptor`s should strictly use `IGameBridge` to talk to the engine. They should *never* hold raw references to `GameEngine.scene`.
