# Input Plugin

**Architectural Role**: Boundary (Input Capture) & Simulation World (Interaction Logic) & External World (Virtual Controls)

This module handles the full input pipeline: capturing raw DOM events, converting them into standard Engine Actions, and processing in-game interactions like raycasting.

## Exported ARC Components

### Adaptors (Boundary)
*   **`EditorInputSystem`**
    *   **Role**: `ActionAdaptor`.
    *   **Responsibility**:
        *   Binds to DOM events (`keydown`, `pointerdown`, etc.).
        *   Converts raw inputs into semantic Actions based on a provided `InputMapping`.
        *   **Editor Focus**: Designed for development/editor use, supporting keyboard shortcuts and mouse clicks.
        *   **Virtual Input**: Can also render and bind on-screen `TouchControls` for mobile/tablet support.

### Systems (Simulation)
*   **`InteractionSystem`**
    *   **Role**: `GameSystem`.
    *   **Responsibility**:
        *   **Raycasting**: Uses the `RenderSystem` to project cursor coordinates into the world.
        *   **Events**: Checks for overlaps with `InteractableComponent`s.
        *   **Dispatch**: Fires `onHoverEnter`, `onHoverExit`, and `onClick` callbacks on relevant actors.

### Components (Simulation)
*   **`InteractableComponent`**
    *   **Role**: `ActorComponent` (Logic).
    *   **Responsibility**:
        *   Marks an Actor as interactive.
        *   Provides simplified callbacks (`onClick`, `onHoverEnter`, `onHoverExit`) for game logic.

### UI (External World)
*   **`TouchControls`**
    *   **Role**: React Component.
    *   **Responsibility**: Renders virtual D-Pad and buttons that feed directly into the `EditorInputSystem`.

## Usage

### 1. Setup Input Mapping (Bridge)
Define what keys trigger what logic actions.

```typescript
const mapping: InputMapping = {
    'Jump': [{ type: 'down', key: 'Space' }, { type: 'tap', button: 0 }], // Space or Left Click
    'Move': [{ type: 'vector', source: 'keys', up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD' }]
};

// Pass to Bridge
bridge.registerContext(new InputSystemContext(mapping));
```

### 2. Interaction in Logic
Make an actor clickable.

```typescript
class Chest extends Actor {
    constructor() {
        super();
        const interact = new InteractableComponent();
        interact.onClick(() => {
            console.log("Chest Opened!");
            this.playAnimation('open');
        });
        this.addComponent(interact);
    }
}
```

### 3. Touch Controls (Mobile)
Enable virtual controls via the context.

```typescript
const touchConfig = {
    dpad: true, // Adds virtual arrow keys
    buttons: [{ label: 'Jump', key: 'Space' }] // Maps button to 'Space' keycode
};

bridge.registerContext(new InputSystemContext(mapping, touchConfig));
```
