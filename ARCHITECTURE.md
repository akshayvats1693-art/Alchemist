# SwarnEngine Architecture

## Overview
SwarnEngine is designed with a strict separation between the **External World** (Hardware, React, Network) and the **Game World** (Simulation, Scene, Actors). The **GameEngine** acts as the deterministic kernel, consuming immutable `FrameInput` to drive the simulation.

## Core Concepts

### 1. External World (Non-Deterministic)
Everything outside the simulation bubble.
-   **Hardware**: Keyboard, Mouse, Gamepad.
-   **Network**: WebRTC/WebSocket packets (arbitrary arrival times).
-   **React/DOM**: The UI layer and the platform harness.
-   **Implementation**: `src/platform/Platform.tsx` is the React entry point (the "Frame") that hosts the engine.

### 2. Simulation World (Deterministic)
The pure logic domain.
-   **GameEngine**: The kernel. Orchestrates the loop.
-   **Scene**: The current game state.
-   **Actors/Systems**: The logic entities.
-   **Constraint**: Can *only* access data passed via `FrameInput` or `EngineContext`.

### 3. The Boundary (FrameInput)
**Implementation**: `src/engine-core/FrameInput.ts`
-   **Concept**: A "Ribbon of Events" that the game simulates over.
-   **Structure**: `FrameInput` contains a list of `DeviceBucket`s (inputs from local hardware or remote clients).
-   **Process**:
    1.  **External**: `ActionAdaptor`s (in `src/engine-core/action`) capture raw events and buffer them.
    2.  **Merge**: The engine bundles these into a `FrameInput` for the current tick.
    3.  **Internal**: Actors use `ActionBinder`s (in `src/engine-core/action`) to query this input (e.g., `isPressed('Jump')`).

## Engine Core Modules

The `src/engine-core` is reorganized into domain-specific modules to enforce this architecture:

### [Action](./../src/engine-core/action/README.md) (`src/engine-core/action`)
Handles the flow of intent across the boundary.
-   **`ActionAdaptor`**: (External) Captures DOM/OS events.
-   **`ActionBinder`**: (Internal) Provides semantic input access to Actors.

### [Bridge](./../src/engine-core/bridge/README.md) (`src/engine-core/bridge`)
Provides safe mechanisms for the External World to control the Simulation.
-   **`IGameBridge`**: Defines safe operations (e.g., `pause`, `loadScene`).
-   **`ScopedGameBridge`**: Ensures external references to the engine are automatically invalidated when the Scene changes, preventing memory leaks and stale state access.

### [Insights](./../src/engine-core/insights/README.md) (`src/engine-core/insights`)
Observability and Telemetry.
-   **`EngineInstrumentation`**: Hooks into the update loop to record performance metrics and logic history ("Tick Records").
-   **`InsightsContext`**: Allows external tools (like the Debug Overlay) to visualize internal engine state without breaking encapsulation.

## Data Flow Pipeline

1.  **Input Capture**: `ActionAdaptor`s accumulate raw events (External World).
2.  **Frame Construction**: `GameEngine` creates `FrameInput` (Boundary).
3.  **Simulation Step**:
    *   `GameSystem.tick()`
    *   `Actor.tick()`
    *   Logic queries `ActionBinder` (Game World).
4.  **Render**: `RenderSystem` draws the state.

## Resolution Independence

The SwarnEngine decoples **Game Logic Coordinates** from **Device Pixels**.

-   **Strict Resolution**: The `CameraActor` defines the logic grid (e.g., `600x1334`).
-   **Canvas Scaling**: The underlying `canvas` element is forced to this size.
-   **CSS Presentation**: The canvas is visually scaled (CSS `width: 100%`) to fit the device screen.
-   **Result**: 100% Deterministic physics and raycasts across all devices, regardless of DPI or screen aspect ratio.

### Standard Formats
1.  **Portrait**: `600x1334` (Mobile-first, e.g., Flappy Bird).
2.  **Landscape**: `1334x600` (Desktop/Tablet, e.g., Balloon Fight).
