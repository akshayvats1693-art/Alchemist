import { toBlob } from 'html-to-image';
import { type FC, useCallback, useState } from 'react';

interface SnapshotControlProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    targetRef: React.RefObject<any>;
}

export const SnapshotControl: FC<SnapshotControlProps> = ({ targetRef }) => {
    const [feedback, setFeedback] = useState<{ id: number; text: string } | null>(null);

    const showFeedback = useCallback((text: string) => {
        const id = Date.now();
        setFeedback({ id, text });
        setTimeout(() => {
            setFeedback(current => (current?.id === id ? null : current));
        }, 2000);
    }, []);

    const takeSnapshot = useCallback(async () => {
        if (!targetRef.current) { return; }
        try {
            const blob = await toBlob(targetRef.current);
            if (!blob) {throw new Error('Failed to create blob');}
            try {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                showFeedback('Snapshot Taken!');
            } catch {
                console.warn('Clipboard write failed, downloading instead.');
                const link = document.createElement('a');
                link.download = `snapshot-${Date.now().toString()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                link.click();
                URL.revokeObjectURL(link.href);
                showFeedback('Snapshot Downloaded');
            }
        } catch (error) {
            console.error(error);
            showFeedback('Snapshot Failed');
        }
    }, [targetRef, showFeedback]);

    return (
        <button
            title="Take Snapshot"
            className="relative px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-2 transition-all bg-[#333] text-white/50 border-[#444] hover:text-white/80 hover:border-[#666]"
            onClick={() => { takeSnapshot().catch(() => { }); }}
        >
            <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm9-8H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H3V8h18v10z" /></svg>
            SNAP
            {feedback && (
                <div key={feedback.id} className="absolute pointer-events-none left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap text-xs text-white font-medium animate-out fade-out slide-out-to-top-2 duration-1000 fill-mode-forwards" style={{ animation: 'rise-fade 1.5s forwards' }}>
                    <span className="bg-black/80 px-2 py-1 rounded shadow-lg border border-white/10">{feedback.text}</span>
                </div>
            )}
        </button>
    );
};
