import '../index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import type { EngineContext } from '../engine-core/EngineContext';
import { Scene } from '../engine-core/Scene';
import { installGlobalErrorHandler } from './GlobalErrorHandler';
import { Platform } from './Platform';

/**
 * Assumes a container with id 'root' exists, or a custom id can be provided.
 */
export interface MountGameConfig {
    sceneFactory: () => Scene;
    rootId?: string;
    overlay?: React.ReactNode;
    contexts?: EngineContext[];
    editorSystems?: import('../engine-core/EditorSystem').EditorSystem[];
    orientation?: 'portrait' | 'landscape';
}

/**
 * Assumes a container with id 'root' exists, or a custom id can be provided.
 */
export function mountGame(config: MountGameConfig): void {
    const {
        sceneFactory,
        rootId = 'root',
        overlay,
        contexts,
        editorSystems,
        orientation = 'portrait'
    } = config;

    installGlobalErrorHandler();

    let rootEl = document.querySelector(`#${rootId}`);
    if (!rootEl) {
        console.info(`mountGame: Root element '#${rootId}' not found. Creating it automatically.`);
        rootEl = document.createElement('div');
        rootEl.id = rootId;
        document.body.appendChild(rootEl);
    }

    ReactDOM.createRoot(rootEl).render(
        <Platform
            scene={sceneFactory}
            contexts={contexts}
            editorSystems={editorSystems}
            orientation={orientation}
        >
            {overlay}
        </Platform>
    );
}
