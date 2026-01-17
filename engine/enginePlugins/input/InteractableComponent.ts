import { ActorComponent } from '../../engine-core/ActorComponent';

export type InteractionCallback = () => void;

/**
 * Component that allows an actor to respond to pointer interaction events.
 */
export class InteractableComponent extends ActorComponent {
    public isEnabled = true;

    private _onClickCallbacks: InteractionCallback[] = [];
    private _onHoverEnterCallbacks: InteractionCallback[] = [];
    private _onHoverExitCallbacks: InteractionCallback[] = [];

    /**
     * Register a callback for click events.
     */
    public onClick(callback: InteractionCallback): void {
        this._onClickCallbacks.push(callback);
    }

    /**
     * Register a callback for hover enter events.
     */
    public onHoverEnter(callback: InteractionCallback): void {
        this._onHoverEnterCallbacks.push(callback);
    }

    /**
     * Register a callback for hover exit events.
     */
    public onHoverExit(callback: InteractionCallback): void {
        this._onHoverExitCallbacks.push(callback);
    }

    /**
     * Internal method to fire the click event.
     *
     * @internal
     */
    public _fireClick(): void {
        if (!this.isEnabled) { return; }
        for (const cb of this._onClickCallbacks) {
            cb();
        }
    }

    /**
     * Internal method to fire the hover enter event.
     *
     * @internal
     */
    public _fireHoverEnter(): void {
        if (!this.isEnabled) { return; }
        for (const cb of this._onHoverEnterCallbacks) {
            cb();
        }
    }

    /**
     * Internal method to fire the hover exit event.
     *
     * @internal
     */
    public _fireHoverExit(): void {
        if (!this.isEnabled) { return; }
        for (const cb of this._onHoverExitCallbacks) {
            cb();
        }
    }
}
