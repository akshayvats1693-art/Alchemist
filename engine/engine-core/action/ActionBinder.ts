import type { FrameInput } from '../FrameInput';
import type { Scene } from '../Scene';

/**
 * Configuration for binding to a specific input channel.
 */
export interface ActionBinderConfig {
    /**
     * The device index to listen to.
     * Default: 0 (Host/Local).
     *
     * @deprecated Use deviceIdFactory for dynamic resolution.
     */
    deviceId?: number;

    /**
     * Factory to retrieve the device index to listen to.
     * Useful for dynamic player assignment (e.g. GetLocalPlayerIndex()).
     * Takes precedence over deviceId.
     */
    deviceIdFactory?: () => number;

    /**
     * The Signal Source ID to listen to.
     * E.g. 'Keyboard', 'Gamepad_0', 'P1_WASD'.
     */
    sourceId: string;
}

/**
 * Helper class to query Input Signals from the current FrameInput.
 * Acts as a "Tuner" that listens to a specific Device + Source frequency.
 */
export class ActionBinder {
    private scene: Scene;
    private config: ActionBinderConfig;

    constructor(scene: Scene, config: ActionBinderConfig) {
        this.scene = scene;
        this.config = config;
    }

    /**
     * Updates the binding configuration.
     * Useful for dynamic controller assignment (e.g. Passing the controller to another player).
     */
    public rebind(config: Partial<ActionBinderConfig>) {
        this.config = { ...this.config, ...config };
    }

    private getSource(input: FrameInput): import('../FrameInput').SignalSource | undefined {
        let devIdx = 0;
        if (this.config.deviceIdFactory) {
            devIdx = this.config.deviceIdFactory();
            // eslint-disable-next-line
        } else if (this.config.deviceId !== undefined) {
            // eslint-disable-next-line
            devIdx = this.config.deviceId;
        }

        // Optimization: We could cache the device reference if we trust the array order,
        // but finding it is safer for now.
        const device = input.devices.find(d => d.deviceIndex === devIdx);
        if (!device) { return undefined; }

        // Find source
        return device.sources.find(s => s.id === this.config.sourceId);
    }

    // eslint-disable-next-line
    private getSignalFromFrame<T>(frame: FrameInput, tag: string): T | undefined {
        const source = this.getSource(frame);
        if (!source) { return undefined; }

        const signal = source.signals.find(s => s.tag === tag);
        return signal ? (signal.val as T) : undefined;
    }

    // eslint-disable-next-line
    public getSignal<T>(tag: string): T | undefined {
        const input = this.scene.gameEngine.currentInput;
        if (!input) { return undefined; }
        return this.getSignalFromFrame<T>(input, tag);
    }

    public isAction(tag: string): boolean {
        const val = this.getSignal<boolean>(tag);
        return Boolean(val);
    }

    public isActionJustPressed(tag: string): boolean {
        const currFrame = this.scene.gameEngine.currentInput;
        const prevFrame = this.scene.gameEngine.previousInput;

        if (!currFrame) { return false; }

        const curr = Boolean(this.getSignalFromFrame<boolean>(currFrame, tag));

        // If no previous frame, assume not pressed previously? Or allow "Frame 1 Press"?
        // Usually, if prev is null, prev is false.
        let prev = false;
        if (prevFrame) {
            prev = Boolean(this.getSignalFromFrame<boolean>(prevFrame, tag));
        }

        return curr && !prev;
    }

    public getAxis(tag: string): number {
        const val = this.getSignal<unknown>(tag);
        if (typeof val === 'number') { return val; }
        return 0;
    }

    public getVector(tag: string): { x: number, y: number } {
        const val = this.getSignal<{ x: number, y: number }>(tag);
        if (val && typeof val.x === 'number' && typeof val.y === 'number') {
            return val;
        }
        return { x: 0, y: 0 };
    }
}
