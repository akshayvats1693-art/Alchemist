import type { IGameBridge } from "./bridge/IGameBridge";
import type { FrameInput } from "./FrameInput";

/**
 * Architecture Role: The Filter.
 *
 * Its job is to "eat up all non-determinism" from the External World (Hardware, Network, UI)
 * before the game loop proceeds. It modifies the FrameInput, making it complete and ready
 * for the immutable Scene realm.
 */
export interface EditorSystem {
    initializeWithScene: (bridge: IGameBridge) => void;
    prepareFrameInput: (input: FrameInput) => FrameInput;
    cleanup?: () => void;
}
