import type { FC } from 'react';
import type { GameEngine } from '../../../engine-core/GameEngine';
import { NetworkContext } from '../../../enginePlugins/networking/NetworkContext';
import type { NetworkingState } from '../../types';

interface NetworkingControlsProps {
    engine: GameEngine | null;
    networkingState: NetworkingState;
    networkStatus: string;
    setNetworkStatus: (status: string) => void;
    disconnect: () => void;
}

export const NetworkingControls: FC<NetworkingControlsProps> = (props) => {
    const { engine, networkingState, networkStatus, disconnect } = props;
    const { connected, isHost, roomId, connectionState, clientCount } = networkingState;

    const handleCreateHost = () => {
        const net = engine?.getEngineContext(NetworkContext);
        if (net) {
            // Override onRoomCreated to handle clipboard side-effect
            const originalOnRoomCreated = net.onRoomCreated;
            net.onRoomCreated = (id) => {
                // Call original if it exists
                if (originalOnRoomCreated !== net.onRoomCreated) {
                    originalOnRoomCreated(id);
                }

                // Copy Share Link
                const url = new URL(window.location.href);
                url.searchParams.set('room', id);

                navigator.clipboard.writeText(url.toString()).catch(console.error);
            };

            net.createHost();
        }
    };

    const handleCopyLink = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('room', roomId);
        navigator.clipboard.writeText(url.toString()).catch(console.error);
    };

    // Determine state for UI
    const showCompactUI = connected || connectionState === 'opening' || connectionState === 'error';

    // LED Logic
    let ledColor = 'bg-gray-400';
    let ledShadow = '';
    let statusTitle = networkStatus;

    if (connectionState === 'opening') {
        ledColor = 'bg-yellow-500';
        ledShadow = 'shadow-[0_0_8px_rgba(234,179,8,0.5)]';
        statusTitle = 'Opening Connection...';
    } else if (connectionState === 'error') {
        ledColor = 'bg-red-500';
        ledShadow = 'shadow-[0_0_8px_rgba(239,68,68,0.5)]';
        statusTitle = 'Connection Failed. Click to retry?';
    } else if (connected) {
        if (isHost && clientCount === 0) {
            ledColor = 'bg-blue-500';
            ledShadow = 'shadow-[0_0_8px_rgba(59,130,246,0.5)]';
            statusTitle = 'Waiting for players...';
        } else {
            ledColor = 'bg-emerald-500';
            ledShadow = 'shadow-[0_0_8px_rgba(16,185,129,0.5)]';
            statusTitle = `Connected (${String(clientCount)} peers)`;
        }
    }

    // Client Count Logic: Only show if we are Host and have opened connection (connected)
    // The user said: "UI of clients should only show when the host has opened the connection"
    // So if opening, maybe not yet?
    const showClientCount = isHost && connected;

    return (
        <div className="flex items-center gap-2 border-l border-[#333] pl-2 transition-all duration-300">
            {showCompactUI ? (
                <div className="flex items-center gap-1.5" title={statusTitle}>
                    {/* LED Indicator */}
                    <div
                        className={`w-2 h-2 rounded-full ${ledColor} ${ledShadow} transition-colors duration-300 animate-pulse`}
                    ></div>

                    {/* Client Count & Icon */}
                    {showClientCount && (
                        <div className="flex items-center gap-0.5 bg-[#222] px-1.5 py-0.5 rounded border border-[#333]">
                            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="text-[10px] text-gray-300 font-mono min-w-[1ch] text-center">
                                {clientCount}
                            </span>
                        </div>
                    )}

                    {/* Disconnect Button (Stop) */}
                    <button
                        className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-red-900/20 text-red-400 border border-red-900/30 hover:bg-red-900/40 hover:text-red-300 transition-colors flex items-center gap-1"
                        title="Disconnect / Stop Hosting"
                        onClick={disconnect}
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Link Button */}
                    {isHost && connected && (
                        <button
                            className="px-1.5 py-0.5 rounded text-[10px] bg-[#222] text-gray-400 border border-[#444] hover:bg-[#333] hover:text-white transition-colors flex items-center gap-1 active:scale-95"
                            title={`Copy Room Link: ${roomId}`}
                            onClick={handleCopyLink}
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </button>
                    )}

                    {/* Retry button if warning/error state */}
                    {connectionState === 'error' && (
                        <button
                            className="ml-1 text-[10px] text-red-400 hover:text-red-300 underline"
                            onClick={handleCreateHost}
                        >
                            Retry
                        </button>
                    )}
                </div>
            ) : (
                <button
                    title="Start Hosting Game"
                    className="px-3 py-1 rounded text-[10px] font-medium 
                             bg-gradient-to-r from-blue-900 to-blue-800 
                             text-blue-100 border border-blue-700/50 
                             hover:from-blue-800 hover:to-blue-700 
                             active:scale-95 active:bg-blue-900 transition-all duration-100
                             shadow-[0_0_10px_rgba(30,58,138,0.3)]
                             hover:shadow-[0_0_15px_rgba(30,58,138,0.5)]"
                    onClick={handleCreateHost}
                >
                    Invite
                </button>
            )}
        </div>
    );
};
