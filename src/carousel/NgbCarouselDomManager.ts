import { ElementRef, Injectable, Renderer2, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NgbCarouselDomManager {
    private _container = inject(ElementRef<HTMLElement>);
    private _renderer = inject(Renderer2); 

    private _getSlideElement(slideId: string): HTMLElement | null {
        return this._container.nativeElement.querySelector(`#slide-${slideId}`);
    }

    setFocus(): void {
        this._container.nativeElement.focus();
    }

    // classes ativas
    setSlideActive(slideId: string, isActive: boolean): void {
        const element = this._getSlideElement(slideId);
        if (element) {
            if (isActive) {
                this._renderer.addClass(element, 'active');
            } else {
                this._renderer.removeClass(element, 'active');
            }
        }
    }
    
    // pega o HTMLElement para transições
    getNativeSlideElement(slideId: string): HTMLElement | null {
        return this._getSlideElement(slideId);
    }
}