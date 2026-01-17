import './TouchControls.css';
import React from 'react';
import type { TouchControlsConfig } from './EditorInputSystem';
import { TouchButton } from './TouchButton';

interface TouchControlsProps {
    config: TouchControlsConfig;
    onPress: (key: string) => void;
    onRelease: (key: string) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ config, onPress, onRelease }) => {
    return (
        <div className="touch-input-container">
            {config.dpad && (
                <div className="dpad-container touch-layer">
                    <TouchButton as="button" className="dpad-btn dpad-up" code="ArrowUp" onPress={onPress} onRelease={onRelease} />
                    <TouchButton as="button" className="dpad-btn dpad-down" code="ArrowDown" onPress={onPress} onRelease={onRelease} />
                    <TouchButton as="button" className="dpad-btn dpad-left" code="ArrowLeft" onPress={onPress} onRelease={onRelease} />
                    <TouchButton as="button" className="dpad-btn dpad-right" code="ArrowRight" onPress={onPress} onRelease={onRelease} />
                </div>
            )}

            {config.buttons && (
                <div className="touch-actions-container touch-layer">
                    {config.buttons.map((btn) => 
                        { return <TouchButton
                            as="div"
                            key={btn.key}
                            className="touch-button"
                            code={btn.key}
                            onPress={onPress}
                            onRelease={onRelease}
                        >
                            {btn.label}
                        </TouchButton> }
                    )}
                </div>
            )}
        </div>
    );
};

interface TouchControlsProps {
    config: TouchControlsConfig;
    onPress: (key: string) => void;
    onRelease: (key: string) => void;
}
