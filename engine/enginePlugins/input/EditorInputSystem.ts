import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ActionAdaptor } from '../../engine-core/action/ActionAdaptor';
import type { IGameBridge } from '../../engine-core/bridge/IGameBridge';
import { EngineContext } from '../../engine-core/EngineContext';
import type { FrameInput } from '../../engine-core/FrameInput';
import { PlatformContext } from '../../engine-core/PlatformContext';
import { TouchControls } from './TouchControls';

export interface ActionTrigger {
    key?: string;
    button?: number;
    type: 'down' | 'tap';
}

export interface AxisTrigger {
    type: 'axis';
    positiveKey: string;
    negativeKey: string;
}

export interface VectorTrigger {
    type: 'vector';
    /** Default 'keys'. */
    source?: 'keys' | 'mouse';
    up?: string;
    down?: string;
    left?: string;
    right?: string;
    /** Optional: Require a button to be held for this vector to update (mouse source only). */
    button?: number;
}

export type InputTrigger = ActionTrigger | AxisTrigger | VectorTrigger;

export type InputMapping = Record<string, InputTrigger[]>;

/**
 * Helper guards.
 */
function isAxisTrigger(t: InputTrigger): t is AxisTrigger {
    return t.type === 'axis';
}

function isVectorTrigger(t: InputTrigger): t is VectorTrigger {
    return t.type === 'vector';
}

export interface TouchButtonConfig {
    label: string;
    key: string;
}

export interface TouchControlsConfig {
    dpad?: boolean;
    buttons?: TouchButtonConfig[];
}

export class InputSystemContext extends EngineContext {
    public mapping: InputMapping;
    public touchConfig?: TouchControlsConfig;

    constructor(mapping: InputMapping, touchConfig?: TouchControlsConfig) {
        super();
        this.mapping = mapping;
        this.touchConfig = touchConfig;
    }
}

export class EditorInputSystem extends ActionAdaptor {
    private context?: InputSystemContext;
    private target?: EventTarget;
    private heldKeys = new Set<string>();
    private justPressedKeys = new Set<string>();

    private touchContainer?: HTMLElement;
    private touchRoot?: Root;

    constructor() {
        super('Keyboard');
    }

    public initializeWithScene(bridge: IGameBridge): void {
        this.context = bridge.getEngineContext(InputSystemContext);
        const platform = bridge.getEngineContext(PlatformContext);

        if (this.context && platform) {
            // Prefer overlay if available, otherwise canvas
            this.target = platform.overlay ?? platform.canvas;
            this.attachListeners(this.target);

            // Initialize touch controls if configured
            this.setupTouchControls();
        } else if (!this.context) {
            console.warn("EditorInputSystem: No InputSystemContext found.");
        } else if (!platform) {
            console.warn("EditorInputSystem: No PlatformContext found.");
        }
    }

    private setupTouchControls() {
        if (!this.context?.touchConfig || !this.target || !(this.target instanceof HTMLElement)) {
            return;
        }

        // Create Container
        this.touchContainer = document.createElement('div');
        // Simple wrapper, styling is in the component
        this.target.appendChild(this.touchContainer);

        this.touchRoot = createRoot(this.touchContainer);
        this.touchRoot.render(
            React.createElement(TouchControls, {
                config: this.context.touchConfig,
                onPress: (key) => {
                    this.heldKeys.add(key);
                    this.justPressedKeys.add(key);
                },
                onRelease: (key) => {
                    this.heldKeys.delete(key);
                }
            })
        );
    }

    private attachListeners(target: EventTarget) {
        // We bind to the target for pointer, but window for keys to ensure we catch everything?
        // Usually target is enough if it has focus.
        target.addEventListener('keydown', this.onKeyDown as EventListener);
        target.addEventListener('keyup', this.onKeyUp as EventListener);
        target.addEventListener('pointerdown', this.onPointerDown as EventListener);
        target.addEventListener('pointerup', this.onPointerUp as EventListener);
        target.addEventListener('pointermove', this.onPointerMove as EventListener);
        window.addEventListener('blur', this.onBlur);
    }

    public destroy() {
        if (!this.target) {
            return;
        }

        this.detachListeners(this.target);
        if (this.touchContainer && this.target instanceof HTMLElement && this.target.contains(this.touchContainer)) {
            this.target.removeChild(this.touchContainer);
        }
    }

    public cleanup() {
        this.destroy(); // Reuse destroy
    }

    private detachListeners(target: EventTarget) {
        target.removeEventListener('keydown', this.onKeyDown as EventListener);
        target.removeEventListener('keyup', this.onKeyUp as EventListener);
        target.removeEventListener('pointerdown', this.onPointerDown as EventListener);
        target.removeEventListener('pointerup', this.onPointerUp as EventListener);
        target.removeEventListener('pointermove', this.onPointerMove as EventListener);
        window.removeEventListener('blur', this.onBlur);
    }

    private onBlur = () => {
        this.heldKeys.clear();
        this.justPressedKeys.clear();
    };

    private onKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) { return; }
        this.heldKeys.add(e.code);
        this.justPressedKeys.add(e.code);
    };

    private onKeyUp = (e: KeyboardEvent) => {
        this.heldKeys.delete(e.code);
    };

    private onPointerDown = (e: PointerEvent) => {
        this.heldKeys.add(`Button${String(e.button)}`);
        this.justPressedKeys.add(`Button${String(e.button)}`);
        if (this.target instanceof Element) {
            this.target.setPointerCapture(e.pointerId);
        }
        this.processMouseVector(e);
    };

    private onPointerUp = (e: PointerEvent) => {
        this.heldKeys.delete(`Button${String(e.button)}`);
        if (this.target instanceof Element) {
            this.target.releasePointerCapture(e.pointerId);
        }
    };

    private onPointerMove = (e: PointerEvent) => {
        if (!this.context) { return; }
        this.processMouseVector(e);
    };

    /** Override to ensure continuous signals for held keys. */
    public override prepareFrameInput(input: FrameInput): FrameInput {
        this.evaluateHeldKeys();
        return super.prepareFrameInput(input);
    }

    private evaluateHeldKeys() {
        if (!this.context) { return; }

        for (const [action, triggers] of Object.entries(this.context.mapping)) {
            let activeVal: unknown = undefined;

            for (const trigger of triggers) {
                if (isAxisTrigger(trigger)) {
                    let val = 0;
                    if (this.heldKeys.has(trigger.positiveKey)) { val += 1; }
                    if (this.heldKeys.has(trigger.negativeKey)) { val -= 1; }

                    if (val !== 0) {
                        activeVal = val;
                    }
                } else if (isVectorTrigger(trigger)) {
                    // Keys handling
                    if (trigger.source !== 'mouse') {
                        let x = 0; let y = 0;
                        if (trigger.right && this.heldKeys.has(trigger.right)) { x += 1; }
                        if (trigger.left && this.heldKeys.has(trigger.left)) { x -= 1; }
                        if (trigger.down && this.heldKeys.has(trigger.down)) { y += 1; }
                        if (trigger.up && this.heldKeys.has(trigger.up)) { y -= 1; }

                        if (x !== 0 || y !== 0) {
                            activeVal = { x, y };
                        }
                    }
                } else {
                    // Action (Button)
                    const collection = trigger.type === 'tap' ? this.justPressedKeys : this.heldKeys;

                    let check = false;
                    if (trigger.key && collection.has(trigger.key)) { check = true; }
                    if (trigger.button !== undefined && collection.has(`Button${String(trigger.button)}`)) { check = true; }

                    if (check) { activeVal = true; }
                }
            }

            if (activeVal !== undefined) {
                this.queueAction({ tag: action, val: activeVal });
            }
        }
        this.justPressedKeys.clear();
    }

    private processMouseVector(e: PointerEvent) {
        if (!this.context) { return; }
        // Calculate position relative to target
        let x = e.clientX;
        let y = e.clientY;

        if (this.target && this.target instanceof HTMLElement) {
            const rect = this.target.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
        }

        for (const [action, triggers] of Object.entries(this.context.mapping)) {
            for (const trigger of triggers) {
                if (isVectorTrigger(trigger) && trigger.source === 'mouse') {
                    // Check if a button constraint is defined
                    if (trigger.button !== undefined) {
                        const buttonHeld = this.heldKeys.has(`Button${String(trigger.button)}`);
                        if (!buttonHeld) { continue; }
                    }

                    // Direct queue for mouse move events (not purely continuous but high frequency)
                    this.queueAction({ tag: action, val: { x, y } });
                }
            }
        }
    }

}
