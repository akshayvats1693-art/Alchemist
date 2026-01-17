# Empty Game Template

This is a minimal "Hello World" template for the SwarnEngine. It demonstrates the fundamental structure of a game, including scene initialization, system registration, and actor instancing.

## Overview
The "Empty" template is designed to be the cleanest starting point for a new game. It sets up the rendering pipeline and an orthographic camera but contains no game-specific logic or complex systems.

## Key Files

### `EmptyScene.ts`
The core `Scene` definition.
-   **Initialization**: Instantiates and adds the `RenderSystem`.
-   **Camera**: Uses `CameraActor.createStandard()` to configure a 600x1334 (HD Portrait) viewport, matching the platform's default orientation.
-   **Actors**: Adds a few simple example actors (`BoxActor`, `FActor`) to prove the rendering pipeline is working.

### `main.tsx`
The entry point.
-   Uses `mountGame` to host the `EmptyScene` within the Platform.

### `goal.md`
A template file for Game Design Documents. Copied to new games to help structure their design and testing goals.

## Usage
To use this template:
1.  Copy the `src/game-templates/empty` directory to `src/games/my-new-game`.
2.  Rename `EmptyScene` to `MyGameScene`.
3.  Update `main.tsx` to mount your new scene.
4.  Begin adding your own Systems and Actors.
