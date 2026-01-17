import { createContext, useContext } from 'react';
import type { GameEngine } from '../engine-core/GameEngine';

export const GameEngineContext = createContext<GameEngine | null>(null);

export function useGameEngineContext(): GameEngine | null {
    return useContext(GameEngineContext);
}
