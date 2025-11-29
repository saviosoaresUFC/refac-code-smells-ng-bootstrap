import { ElementRef, Renderer2, inject } from '@angular/core';

export class NgbNavPaneDomHelper {

    private _elRef = inject(ElementRef);
    private _renderer = inject(Renderer2);

    setClasses(classes: string[], add: boolean): void {
        classes.forEach(cls => {
            if (add) {
                this._renderer.addClass(this._elRef.nativeElement, cls);
            } else {
                this._renderer.removeClass(this._elRef.nativeElement, cls);
            }
        });
    }

    getNativeElement(): HTMLElement {
        return this._elRef.nativeElement;
    }
}