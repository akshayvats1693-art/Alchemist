# Platform

The `src/platform` directory contains the React-based hosting environment for the SwarnEngine. It serves as the bridge between the raw Game Engine (Canvas/WebGL) and the Web Browser (DOM/React), managing the engine's lifecycle, input handling, and specific browser integrations.

## Core Responsibilities

1.  **Engine Hosting**: Instantiating and managing the lifecycle of the `GameEngine`.
2.  **Game Loop**: Driving the engine via `requestAnimationFrame` and managing time scaling/pausing.
3.  **Rendering Surface**: Providing and resizing the `<canvas>` element.
4.  **UI Overlay**: managing a DOM layer on top of the canvas for Game UI (HUD) and Debug Tools.
5.  **Browser Integration**: Handling fullscreen, orientation locking, and global error catching.

## Key Components

### `Platform.tsx`
The primary React component that wraps the game. It orchestrates:
-   **Engine Initialization**: via `useGameEngine`.
-   **Game Loop**: via `useGameLoop`.
-   **Networking UI**: Monitoring connection status via `useNetworking`.
-   **Layout**: Rendering the `PlatformShell`, `GameCanvas`, and children (Game UI).

### `mountGame.tsx`
The standard entry point for all games. It simplifies the process of mounting the `Platform` component into a DOM element.
```tsx
mountGame({
    sceneFactory: () => new MyGameScene(),
    rootId: 'game-container',
    contexts: [new InputSystemContext(myMapping)], // Inject specialized contexts
    editorSystems: [myActionAdaptor], // Inject specialized systems
    orientation: 'portrait' // Enforce orientation
});
```

### `GameEngineContext.tsx`
A React Context (`Context<GameEngine | null>`) that allows any component within the Platform tree to access the running engine instance. This is crucial for UI components that need to read game state or trigger actions.

### `hooks/`
A collection of custom hooks to isolate platform logic:
-   `useGameEngine.ts`: Handles the complex logic of creating the `GameEngine`, injecting default contexts (Render, Platform, Network, Insights), and disposing of it on unmount.
-   `useGameLoop.ts`: Binds the engine's `tick()` method to the browser's animation frame.
-   `useNetworking.ts`: Provides a reactive view of the networking system's state (Connected, Host/Client, Peer ID).
-   `useRenderStats.ts`: simple fps counter and render stats.

## Architecture

### The "Overlay" Pattern
The Platform creates a `div` (ref `overlapRef`) positioned absolutely over the game canvas.
-   **Input**: This layer (or children) captures pointer events, allowing the `EditorInputSystem` to translate DOM events into Game Actions.
-   **UI**: React components (Health bars, Inventory, Menus) are rendered into this layer, allowing them to exist in the DOM but appear as part of the game.

### Context & System Injection
The Platform automatically injects essential contexts if they are missing:
-   `RenderContext`: Wraps the Canvas.
-   `PlatformContext`: Wraps the Overlay div.
-   `NetworkContext`: Handles Multiplayer.
-   `InsightsContext`: Handles Debugging/Telemetry.

Games can inject their own specific contexts (like `InputSystemContext`) which are merged with these defaults.

## Usage
To create a new game entry point, create a `main.tsx`:

```tsx
import { mountGame } from '../../platform/mountGame';
import { MyScene } from './MyScene';

mountGame({
    sceneFactory: () => new MyScene(),
    orientation: 'landscape'
});
```
