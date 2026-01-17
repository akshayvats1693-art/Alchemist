import React, { forwardRef } from 'react';
import { useVisualViewport } from '../hooks/useVisualViewport';

interface PlatformShellProps {
    orientation: 'portrait' | 'landscape';
    children: React.ReactNode;
}

export const PlatformShell = forwardRef<HTMLDivElement, PlatformShellProps>(({ orientation, children }, ref) => {
    // Abstraction: Handling mobile viewport quirks (address bars, keyboards) is complex.
    // We delegate this to a specialized hook to keep the shell component clean/declarative.
    const height = useVisualViewport();

    return (
        <div
            className="lg:flex lg:items-center lg:justify-center p-0 lg:p-8 pb-[env(safe-area-inset-bottom)]"
            style={{ height }}
        >
            <div
                ref={ref}
                className={`flex flex-col shadow-none lg:shadow-2xl rounded-none lg:rounded-xl border-0 lg:border border-[#333] w-full h-full ${orientation === 'portrait'
                    ? 'lg:max-w-[600px] lg:max-h-[1334px]'
                    : 'lg:max-w-[1334px] lg:max-h-[600px]'
                    }`}
            >
                {children}
            </div>
        </div>
    );
});

PlatformShell.displayName = 'PlatformShell';
