/**
 * A discrete unit of entropy (V2).
 * E.g. `{ tag: 'Jump', val: true }` or `{ tag: 'Move', val: {x:1, y:0} }`.
 */
export interface ActionSignal {
    tag: string;
    val: unknown;
}

/**
 * A named source of signals within a device (V2).
 * E.g. 'Keyboard', 'Gamepad_0', 'Network'.
 */
export interface SignalSource {
    id: string;
    signals: ActionSignal[];
}

/**
 * A physical source of data (Machine/Peer) (V2).
 * Device 0 = Host. Device N = Client.
 */
export interface DeviceBucket {
    deviceIndex: number;
    sources: SignalSource[];
}

export interface FrameInput {
    /**
     * Delta time for this frame (in seconds).
     */
    dt: number;

    /**
     * The new Signal-Centric Input Model (V2).
     * Sequencing is implicit via Lockstep/PacketBus order.
     */
    devices: DeviceBucket[];


}
