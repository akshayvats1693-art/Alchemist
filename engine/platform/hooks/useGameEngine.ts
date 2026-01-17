import { useEffect, useRef, useState } from 'react';
import type { EditorSystem } from '../../engine-core/EditorSystem';
import type { EngineContext } from '../../engine-core/EngineContext';
import { GameEngine } from '../../engine-core/GameEngine';
import { InsightsContext } from '../../engine-core/insights/InsightsContext';
import { InsightsInstrumentation } from '../../engine-core/insights/InsightsInstrumentation';
import { PlatformContext } from '../../engine-core/PlatformContext';
import { EditorInputSystem } from '../../enginePlugins/input/EditorInputSystem';
import { NetworkContext } from '../../enginePlugins/networking/NetworkContext';
import { NetworkSystem } from '../../enginePlugins/networking/NetworkSystem';
import { RenderContext } from '../../enginePlugins/render/RenderContext';
import type { PlatformProps } from '../types';

export function useGameEngine(props: PlatformProps, restartKey: number) {
    const {
        scene,
        engineClass,
        contexts = [],
        editorSystems = [],
        onEngineInit
    } = props;

    const [engine, setEngine] = useState<GameEngine | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const overlapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current) { return; }

        // 1. Setup
        const EngineClass = engineClass ?? GameEngine;

        // 2. Prepare Contexts
        // Start with provided contexts
        const finalContexts: EngineContext[] = [...contexts];

        // Ensure RenderContext exists and has user's canvas
        if (!finalContexts.some(c => c instanceof RenderContext)) {
            finalContexts.push(new RenderContext(canvasRef.current));
        }

        // Ensure PlatformContext exists
        if (!finalContexts.some(c => c instanceof PlatformContext)) {
            finalContexts.push(new PlatformContext(canvasRef.current, overlapRef.current));
        }

        // Check for Room ID in URL
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room');

        // Ensure NetworkContext
        if (!finalContexts.some(c => c instanceof NetworkContext)) {
            const nc = new NetworkContext();
            if (roomId) {
                nc.roomId = roomId;
            }
            finalContexts.push(nc);
        }

        // Ensure InsightsContext
        if (!finalContexts.some(c => c instanceof InsightsContext)) {
            const insightsContext = new InsightsContext();
            finalContexts.push(insightsContext);
            // We'll set instrumentation below
        }

        // 3. Prepare Systems
        // We always include standard editor systems
        const systems: EditorSystem[] = [new EditorInputSystem(), new NetworkSystem(), ...editorSystems];

        const newEngine = new EngineClass(finalContexts as never[], systems);

        // Wiring instrumentation
        const insightsCtx = newEngine.getEngineContext(InsightsContext);
        if (insightsCtx) {
            newEngine.instrumentation = new InsightsInstrumentation(insightsCtx);
        }



        newEngine.setScene(scene);

        setEngine(newEngine);
        if (onEngineInit) { onEngineInit(newEngine); }

        return () => {
            newEngine.dispose();
            setEngine(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scene, engineClass, restartKey]); // Re-init if scene, engine class, or restartKey changes

    return { engine, canvasRef, containerRef, overlapRef };
}
