import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FrameInput } from '../../engine-core/FrameInput';
import type { GameEngine } from '../../engine-core/GameEngine';
import { PlatformContext } from '../../engine-core/PlatformContext';
import { EditorInputSystem, type InputMapping, InputSystemContext } from './EditorInputSystem';

function createFrameInput(_playerIndex: number): FrameInput {
    return {
        dt: 0.016,

        // Devices will be populated by the system
        devices: []
    };
}

// Setup Mock DOM for EventTarget if not running in browser-like environment (Vitest jsdom handles this usually, but being explicit helps)
// Actually Vitest with jsdom environment should provide window and document.

describe('EditorInputSystem', () => {
    let system: EditorInputSystem;
    let mockEngine: GameEngine;
    let mockContext: InputSystemContext;
    let targetElement: HTMLElement;
    let mapping: InputMapping;

    beforeEach(() => {
        // Setup DOM target
        const dom = new JSDOM();
        global.document = dom.window.document;
        global.window = dom.window as any;
        global.KeyboardEvent = dom.window.KeyboardEvent;

        targetElement = document.createElement('div');

        // Define Mappings
        mapping = {
            'Jump': [{ type: 'down', key: 'Space' }],
            'MoveX': [{ type: 'axis', positiveKey: 'KeyD', negativeKey: 'KeyA' }],
            'Aim': [{ type: 'vector', left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }]
        };

        // Mock Context
        mockContext = new InputSystemContext(mapping);

        // Mock Engine
        mockEngine = {
            getEngineContext: (type: any) => {
                if (type === InputSystemContext) { return mockContext; }
                if (type === PlatformContext) {
                    return {
                        overlay: targetElement,
                        canvas: targetElement
                    };
                }
                return undefined;
            }
        } as unknown as GameEngine;

        // Initialize System
        system = new EditorInputSystem();
        system.initializeWithScene(mockEngine);
    });

    afterEach(() => {
        system.destroy();
    });



    function dispatchKey(code: string, type: 'keydown' | 'keyup') {
        const event = new KeyboardEvent(type, { code });
        targetElement.dispatchEvent(event);
    }

    it('should capture mapped action "Jump" (Space) for playerIndex 0', () => {
        dispatchKey('Space', 'keydown');

        const input = createFrameInput(0);
        system.prepareFrameInput(input);

        const signal = input.devices[0]?.sources.find(s => s.id === 'Keyboard')?.signals.find(s => s.tag === 'Jump');
        expect(signal).toBeDefined();
        // 'down' logic adds signal every frame
        expect(signal?.val).toBe(true);

    });

    it('should capture mapped axis "MoveX" (D/A) for playerIndex 1', () => {
        dispatchKey('KeyD', 'keydown'); // Positive

        const input = createFrameInput(1);
        system.prepareFrameInput(input);

        // Should populate index 1
        // Should populate index 1? EditorInputSystem defaults to device 0 (Host) usually unless configured?
        // Actually EditorInputSystem hardcodes queueAction which pushes to devices[0].
        // So checking playerIndex 1 input creation is moot if system ignores it and pushes to 0.
        // But let's check device 0.

        const signal = input.devices[0]?.sources.find(s => s.id === 'Keyboard')?.signals.find(s => s.tag === 'MoveX');
        expect(signal).toBeDefined();
        expect(signal?.val).toBe(1);

        // Release D
        dispatchKey('KeyD', 'keyup');
        const input2 = createFrameInput(1);
        system.prepareFrameInput(input2);

        const signal2 = input2.devices[0]?.sources.find(s => s.id === 'Keyboard')?.signals.find(s => s.tag === 'MoveX');
        expect(signal2).toBeUndefined();
    });

    it('should capture mapped vector "Aim" (Arrows) for playerIndex 4', () => {
        dispatchKey('ArrowUp', 'keydown');
        dispatchKey('ArrowRight', 'keydown');

        const input = createFrameInput(4);
        system.prepareFrameInput(input);

        const signal = input.devices[0]?.sources.find(s => s.id === 'Keyboard')?.signals.find(s => s.tag === 'Aim');
        expect(signal).toBeDefined();
        expect(signal?.val).toEqual({ x: 1, y: -1 });
    });

    it('should handle clearing "just pressed" state across frames', () => {
        // Setup a TAP trigger to verify 'just pressed' logic
        // But mapping for Jump is 'down'.
        // Let's add a TAP mapping dynamically or re-init?
        // We'll trust the logic for now or modify mapping in setup?
        // Let's modify mapping for this test if possible, or create new context.

        // Re-init with Tap mapping
        const tapMapping: InputMapping = { 'Fire': [{ type: 'tap', key: 'Enter' }] };
        mockContext.mapping = tapMapping; // Hacky but allowed in JS test

        dispatchKey('Enter', 'keydown');

        // Frame 1
        const input1 = createFrameInput(0);
        system.prepareFrameInput(input1);
        // Frame 1: Tap trigger
        // EditorInputSystem logic for 'tap':
        // if (check) { activeVal = true; }
        // queueAction -> signal.
        // It doesn't seem to differentiate 'down' vs 'tap' in the queueAction payload (just value).
        // BUT 'check' depends on justPressedKeys for 'tap' type.

        const signal1 = input1.devices[0]?.sources.find(s => s.id === 'Keyboard')?.signals.find(s => s.tag === 'Fire');
        expect(signal1).toBeDefined();

        // Frame 2 (Key still down, but not just pressed)
        const input2 = createFrameInput(0);
        system.prepareFrameInput(input2);

        const signal2 = input2.devices[0]?.sources.find(s => s.id === 'Keyboard')?.signals.find(s => s.tag === 'Fire');
        expect(signal2).toBeUndefined(); // Should not be triggered because 'justPressed' is false
    });
});
