import { InputSystemContext, mountGame } from '@swarnos/engine';
import { FlappyScene } from './FlappyScene';

mountGame({
    sceneFactory: () => new FlappyScene(),
    contexts: [
        new InputSystemContext({
            Flap: [
                { type: 'down', key: 'Space' },
                { type: 'down', button: 0 } // Left mouse / Touch
            ]
        })
    ]
});
