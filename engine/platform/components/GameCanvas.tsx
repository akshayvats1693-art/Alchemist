import React, { forwardRef } from 'react';

interface GameCanvasProps {
    className?: string;
    children?: React.ReactNode;
}

export const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(({ className, children }, ref) => {
    return (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col items-center justify-center relative bg-black">
            <canvas
                className={`w-full flex-1 min-h-0 outline-none ${className || ''}`}
                ref={ref}
                tabIndex={0}
            />

            {children ? (
                <div className="absolute inset-0 pointer-events-none">
                    {children}
                </div>
            ) : null}
        </div>
    );
});

GameCanvas.displayName = 'GameCanvas';
