# Game Design Document: Flappy Bird

## Overview
A simple Flappy Bird clone where the player controls a bird, trying to fly between columns of green pipes without hitting them.

## Gameplay Architecture

### Core Concepts
-   **Objective**: Survive as long as possible by passing through pipes.
-   **Controls**: Press 'Space' or click to flap (jump).
-   **Win Condition**: No formal win, just high score.
-   **Fail Condition**: Colliding with a pipe or the ground.

### Architecture Breakdown
-   **Scene**: `FlappyScene` - Manages the bird, pipes, and scrolling background.
-   **Systems**: 
    -   `PhysicsSystem`: Handles gravity and bird movement.
    -   `RenderSystem`: Draws the bird and pipes.
-   **Actors**:
    -   `Bird`: Player character with physics and collision.
    -   `Pipe`: Obstacles that move left.
    -   `Ground`: Stationary obstacle at the bottom.
-   **Components**:
    -   `PhysicsComponent`: For bird gravity and velocity.
    -   `BoxCollisionComponent`: For hit detection.
    -   `BoxRenderer`: For visual representation.

## Implementation Plan
1.  **Phase 1: Minimum Viable Loop**
    -   Implement Bird with gravity and jump input.
    -   Simple box rendering.
2.  **Phase 2: Core Mechanics**
    -   Pipe spawning and movement.
    -   Collision detection for pipes and ground.
    -   Game over state/Restart.
3.  **Phase 3: Refinement**
    -   Background elements.
    -   Score tracking.
