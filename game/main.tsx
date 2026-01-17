import { InputSystemContext, mountGame } from '@swarnos/engine';
import { EmptyScene } from './EmptyScene';

mountGame({
    sceneFactory: () => new EmptyScene(),
    contexts: [
        new InputSystemContext({
            // Define your input mappings here.
            // Example:
            // Jump: [{ type: 'down', key: 'Space' }]
        })
    ]
});
