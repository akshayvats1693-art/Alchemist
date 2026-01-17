export interface IGameBridge {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getEngineContext: <T extends import('../EngineContext').EngineContext>(type: new (...args: any[]) => T) => T | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getGameSystem: <T extends import('../GameSystem').GameSystem>(type: new (...args: any[]) => T) => T | undefined;
    simulate: (input: import('../FrameInput').FrameInput) => void;
    reloadScene: () => void;
}
