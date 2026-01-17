import { useEffect, useState } from 'react';
import type { GameEngine } from '../../engine-core/GameEngine';
import { NetworkContext } from '../../enginePlugins/networking/NetworkContext';
import type { NetworkingState } from '../types';

export function useNetworking(engine: GameEngine | null) {
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [state, setState] = useState<NetworkingState>({
        connected: false,
        isHost: false,
        roomId: '',
        connectionState: 'closed',
        clientCount: 0
    });


    useEffect(() => {
        if (!engine) { return; }

        // Reset status on engine change
        // eslint-disable-next-line react-you-might-not-need-an-effect/no-adjust-state-on-prop-change
        setStatusMessage('');

        // eslint-disable-next-line react-you-might-not-need-an-effect/no-pass-data-to-parent
        const net = engine.getEngineContext(NetworkContext);
        if (net) {
            setState({
                connected: net.isConnected,
                isHost: net.isHost,
                roomId: net.roomId || (new URLSearchParams(window.location.search).get('room') || ''),
                connectionState: net.connectionState,
                clientCount: net.clientCount
            });

            const originalOnStatusMessage = net.onStatusMessage;

            net.onConnectionChanged = (c, h, r, s, count) => {
                setState({
                    connected: c,
                    isHost: h,
                    roomId: r || '',
                    connectionState: s,
                    clientCount: count
                });
            };

            net.onStatusMessage = (msg) => {
                // Heuristic for connection failures if not explicitly handled
                if (msg.includes('Peer error') || msg.includes('failed')) {
                    // We might want to trigger a state update here if we aren't already
                    // But connectionState is authoritative-ish.
                    // The log() in NetworkSystem calls onStatusMessage.
                    // It doesn't update connectionState there yet.
                    // I will update NetworkSystem to handle error state better.
                }
                setStatusMessage(msg);
                originalOnStatusMessage(msg);
            };
        }
    }, [engine]);

    const createHost = () => {
        const net = engine?.getEngineContext(NetworkContext);
        if (net) {
            // Optimistic update
            setState(prev => ({ ...prev, connectionState: 'opening' }));
            setStatusMessage('Creating Host...');
            net.createHost();
        }
    };

    const disconnect = () => {
        const net = engine?.getEngineContext(NetworkContext);
        if (net) {
            net.disconnect();
        }
    };

    return {
        networkingState: state,
        networkStatus: statusMessage,
        setNetworkStatus: setStatusMessage,
        createHost,
        disconnect
    };

}
