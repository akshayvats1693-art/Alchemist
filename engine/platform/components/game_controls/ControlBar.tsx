import type { FC, ReactNode } from 'react';

interface ControlBarProps {
    children: ReactNode;
}

export const ControlBar: FC<ControlBarProps> = ({ children }) => {
    return (
        <div className="w-full flex flex-wrap items-center gap-2 px-2 py-1 bg-[#1e1e1eE6] backdrop-blur-md border-b border-[#000] text-white/90 select-none">
            {children}
        </div>
    );
};
