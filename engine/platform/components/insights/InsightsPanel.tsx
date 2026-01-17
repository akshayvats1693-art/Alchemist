import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../../../engine-core/GameEngine';
import { type InputDiff, InsightsContext, type TickRecord } from '../../../engine-core/insights/InsightsContext';

interface InsightsPanelProps {
    engine: GameEngine | null;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ engine }) => {


    // We store the raw history list
    const [history, setHistory] = useState<TickRecord[]>([]);
    const [knownSystems, setKnownSystems] = useState<string[]>([]);

    interface SelectedItem {
        system: string;
        diff: InputDiff;
        tick: number;
    }

    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollRight = useRef(true);

    /** Pixel width per tick column. */
    const CELL_WIDTH = 40;
    /** Pixel height per system row. */
    const ROW_HEIGHT = 40;
    /** Width of the sticky system name column. */
    const HEADER_WIDTH = 200;

    const lastVersionRef = useRef<number>(-1);
    const lastUpdateRef = useRef<number>(0);

    useEffect(() => {
        if (!engine) { return; }
        const insights = engine.getEngineContext(InsightsContext);
        if (!insights) { return; }

        let animationFrameId: number;

        const loop = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(loop);

            // Throttle UI updates to 10 FPS (100ms) to avoid blocking main thread
            if (timestamp - lastUpdateRef.current < 100) {
                return;
            }

            const currentVersion = insights.getVersion();
            if (currentVersion !== lastVersionRef.current) {
                lastUpdateRef.current = timestamp;
                lastVersionRef.current = currentVersion;

                setHistory([...insights.getHistory()]);
                setKnownSystems(insights.getKnownSystems());
            }
        };

        animationFrameId = requestAnimationFrame(loop);

        return () => { cancelAnimationFrame(animationFrameId); };
    }, [engine]);

    /** Auto-scroll logic (simple). */
    useEffect(() => {
        if (containerRef.current && lastScrollRight.current) {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        }
    }, [history.length]);

    const handleScroll = () => {
        if (!containerRef.current) { return; }
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        const isAtRight = scrollWidth - (scrollLeft + clientWidth) < 50;
        lastScrollRight.current = isAtRight;
    };

    const handleCellClick = (e: React.MouseEvent, item: SelectedItem) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
            // Toggle selection
            setSelectedItems(prev => {
                const exists = prev.some(i => i.tick === item.tick && i.system === item.system);
                if (exists) {
                    return prev.filter(i => !(i.tick === item.tick && i.system === item.system));
                }
                return [...prev, item].sort((a, b) => a.tick - b.tick);
            });
        } else {
            // Single selection
            setSelectedItems([item]);
        }
    };

    const handleCopy = () => {
        const textToCopy = selectedItems.map(item => {
            return `Tick ${String(item.tick)} - ${item.system} Changes:\n${JSON.stringify(item.diff, null, 2)}`;
        }).join('\n\n');

        navigator.clipboard.writeText(textToCopy).catch(error => {
            console.error('Failed to copy: ', error);
        });
    };

    const filteredHistory = React.useMemo(() =>
        history.filter(record => record.stages.some(s => Object.keys(s.diff).length > 0))
        , [history]);

    if (!engine) { return null; }

    // Render Grid
    // Rows: Systems
    // Columns: Ticks

    return (
        <div className="w-full flex flex-col bg-black border-t border-gray-800 text-white font-sans select-none h-96">
            <div className="flex flex-row items-center p-2 bg-gray-800 border-b border-gray-700 justify-between flex-shrink-0">
                <div className="text-sm font-bold text-gray-200">Input Pipeline Insights (Raw)</div>
                <div className="text-xs text-gray-400">Frames: {history.length} (Active: {filteredHistory.length})</div>
            </div>

            <div className="flex-grow overflow-auto relative flex flex-row custom-scrollbar" ref={containerRef} onScroll={handleScroll}>
                {/* Sticky Left Column: System Headers */}
                <div className="sticky left-0 z-20 bg-gray-900 border-r border-gray-700 flex-shrink-0" style={{ width: `${String(HEADER_WIDTH)}px` }}>
                    <div className="h-8 border-b border-gray-700 bg-gray-800 flex items-center px-2 text-xs font-bold text-gray-400">
                        System / Tick
                    </div>
                    {knownSystems.map(sys => {
                        return <div key={sys} className="border-b border-gray-800 flex items-center px-2 text-xs text-blue-300 font-mono truncate" style={{ height: `${String(ROW_HEIGHT)}px` }}>
                            {sys}
                        </div>
                    }
                    )}
                </div>

                {/* Main Grid: Columns of Ticks */}
                <div className="flex flex-row relative">
                    {filteredHistory.map((record) => {
                        return (
                            <div key={record.tick} className="flex flex-col border-r border-gray-800 flex-shrink-0" style={{ width: `${String(CELL_WIDTH)}px` }}>
                                {/* Tick Header */}
                                <div className="h-8 border-b border-gray-700 bg-gray-800 text-[10px] text-gray-500 flex items-center justify-center font-mono">
                                    {record.tick}
                                </div>

                                {/* Cells for each system */}
                                {knownSystems.map(sys => {
                                    const stage = record.stages.find(s => s.systemName === sys);
                                    let bgClass = "bg-transparent";

                                    if (stage) {
                                        const diffKeys = Object.keys(stage.diff);
                                        const hasDiff = diffKeys.length > 0;
                                        if (hasDiff) {
                                            // Highlight selected cell
                                            const isSelected = selectedItems.some(i => i.system === sys && i.tick === record.tick);

                                            if (isSelected) {
                                                bgClass = "bg-green-600 cursor-pointer";
                                            } else {
                                                bgClass = "bg-green-900/40 hover:bg-green-700/50 cursor-pointer";
                                            }
                                        }

                                        // Interaction
                                        if (hasDiff) {
                                            return (
                                                <div
                                                    key={`${String(record.tick)}-${sys}`}
                                                    className={`border-b border-gray-800 ${bgClass} flex items-center justify-center transition-colors`}
                                                    style={{ height: `${String(ROW_HEIGHT)}px` }}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(e) => { handleCellClick(e, { system: sys, diff: stage.diff, tick: record.tick }); }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            handleCellClick(e as unknown as React.MouseEvent, { system: sys, diff: stage.diff, tick: record.tick });
                                                        }
                                                    }}
                                                >
                                                    <div className="w-1.5 h-4 bg-green-500 opacity-50 rounded-sm" />
                                                </div>
                                            );
                                        }
                                    }

                                    // Empty / Pass-through / System didn't run?
                                    return (
                                        <div
                                            key={`${String(record.tick)}-${sys}`}
                                            className="border-b border-gray-800 flex items-center justify-center"
                                            style={{ height: `${String(ROW_HEIGHT)}px` }}
                                        >
                                            {/* Empty */}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Details Panel */}
            <div className="h-32 border-t border-gray-700 bg-gray-900 p-2 overflow-auto font-mono text-xs flex-shrink-0 transition-all relative">
                {selectedItems.length > 0 && (
                    <button
                        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs border border-gray-600 z-10"
                        title="Copy to Clipboard"
                        onClick={handleCopy}
                    >
                        Copy JSON
                    </button>
                )}
                {selectedItems.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {selectedItems.map((item, idx) => {
                            return (
                                <div key={`${String(item.tick)}-${item.system}-${String(idx)}`} className="border-b border-gray-800 pb-2 mb-2 last:border-0">
                                    <div className="font-bold text-green-400 mb-1">
                                        Tick {item.tick} - {item.system} Changes:
                                    </div>
                                    <pre className="whitespace-pre-wrap text-blue-300">
                                        {JSON.stringify(item.diff, null, 2)}
                                    </pre>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-gray-500 italic flex items-center justify-center h-full">
                        Click (or Ctrl+Click) on green blocks to inspect changes.
                    </div>
                )}
            </div>
        </div>
    );
};
