import type { IGameBridge } from '../bridge/IGameBridge';
import type { EditorSystem } from '../EditorSystem';
import type { ActionSignal, FrameInput, SignalSource } from '../FrameInput';

export abstract class ActionAdaptor implements EditorSystem {
    private actionSignals: ActionSignal[] = [];

    public readonly signalSourceId: string;

    constructor(signalSourceId: string) {
        this.signalSourceId = signalSourceId;
    }

    /**
     * Default empty implementation, overrides can optionally use bridge.
     */
    public initializeWithScene(bridge: IGameBridge): void { }

    /**
     * Helper for subclasses to queue signals (e.g. From event listeners).
     */
    protected queueAction(action: ActionSignal): void {
        this.actionSignals.push(action);
    }

    public prepareFrameInput(input: FrameInput): FrameInput {
        if (this.actionSignals.length > 0) {
            const source: SignalSource = {
                id: this.signalSourceId,
                signals: [...this.actionSignals]
            };

            // Ensure devices[0] exists (Host)
            if (!input.devices[0]) {
                input.devices[0] = { deviceIndex: 0, sources: [] };
            }

            input.devices[0].sources.push(source);
            this.actionSignals = [];
        }
        return input;
    }
}
