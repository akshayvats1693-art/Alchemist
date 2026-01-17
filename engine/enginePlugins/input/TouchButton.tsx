import React, { useState } from 'react';

export interface TouchButtonProps {
    className: string;
    code: string;
    onPress: (key: string) => void;
    onRelease: (key: string) => void;
    children?: React.ReactNode;
    as?: 'button' | 'div';
}

export const TouchButton: React.FC<TouchButtonProps> = ({ className, code, onPress, onRelease, children, as = 'div' }) => {
    const [active, setActive] = useState(false);

    const handleDown = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setActive(true);
        onPress(code);
    };

    const handleUp = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        setActive(false);
        onRelease(code);
    };

    const Component = as as React.ElementType;

    return (
        <Component
            className={`${className} ${active ? 'active' : ''}`}
            onPointerDown={handleDown}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
            onContextMenu={(e: React.MouseEvent) => { e.preventDefault(); }}
        >
            {children}
        </Component>
    );
};
