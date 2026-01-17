
/**
 * Installs a global error handler that catches uncaught exceptions and unhandled rejections,
 * displaying them in an overlay on the screen.
 * 
 * This is useful for development to see errors immediately without opening the console.
 */
export function installGlobalErrorHandler(): void {
    if (document.querySelector('#error-overlay')) {
        return; // Already installed
    }

    const overlay = document.createElement('div');
    overlay.id = 'error-overlay';
    Object.assign(overlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        color: 'red',
        background: 'rgba(0,0,0,0.8)',
        zIndex: '9999',
        display: 'none',
        whiteSpace: 'pre-wrap',
        padding: '20px',
        boxSizing: 'border-box',
        pointerEvents: 'none' // Allow clicking through if needed, though usually errors block everything
    });
    document.body.appendChild(overlay);

    const showError = (message: string | Event, source?: string, lineno?: number, colno?: number) => {
        overlay.style.display = 'block';
        const loc = source ? `\nAt: ${source}:${String(lineno ?? '?')}:${String(colno ?? '?')}` : '';
        const msgStr = typeof message === 'string' ? message : 'Unknown Error';
        overlay.innerText += `Error: ${msgStr}${loc}\n\n`;

        console.error('Captured Error:', message);
    };

    window.onerror = function (message, source, lineno, colno) {
        showError(message, source, lineno, colno);
    };

    window.onunhandledrejection = function (event) {
        overlay.style.display = 'block';
        const reasonStr = event.reason instanceof Error ? event.reason.message : String(event.reason);
        overlay.innerText += `Unhandled Rejection: ${reasonStr}\n\n`;

        console.error('Captured Rejection:', event.reason);
    };
}
