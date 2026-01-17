
import { Actor } from '@swarnos/engine';
import { BoxRenderer } from '@swarnos/engine';

export class FActor extends Actor {
    constructor(x: number, y: number) {
        super();
        this.transform.position.set(x, y, 0);

        const color = 0xffffff;

        // Vertical Bar 
        // Size: 20x100
        const vBar = new BoxRenderer(20, 100, color);
        // Default box is centered at 0,0 locally.
        this.addComponent(vBar);

        // Top Horizontal Bar
        // Size: 50x20
        const topBar = new BoxRenderer(50, 20, color);
        // Center x=35, y=40.
        // Width 50 -> Left=35-25=10. Vertical Right=10. Matches.
        topBar.offset.set(35, 40, 0);
        this.addComponent(topBar);

        // Middle Horizontal Bar
        // Size: 30x20
        const midBar = new BoxRenderer(30, 20, color);
        // Center x=25, y=0.
        // Width 30 -> Left=25-15=10. Vertical Right=10. Matches.
        midBar.offset.set(25, 0, 0);
        this.addComponent(midBar);
    }
}
