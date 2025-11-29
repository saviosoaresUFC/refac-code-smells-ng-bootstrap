import { ElementRef, Injectable, NgZone, inject, DOCUMENT } from '@angular/core';
import { getFocusableBoundaryElements, ngbRunTransition, reflow } from '@ng-bootstrap/ng-bootstrap/utils';
import { Observable, zip, fromEvent, Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { ModalDismissReasons } from './modal-dismiss-reasons';

@Injectable({ providedIn: 'root' })
export class NgbModalWindowDomHelper {
    private _elRef = inject(ElementRef<HTMLElement>);
    private _zone = inject(NgZone);
    private _document = inject(DOCUMENT);

    private _elWithFocus: Element | null = null;

    runShowTransition(animation: boolean, dialogEl: ElementRef<HTMLElement>): Observable<any[]> {
        const windowTransition$ = ngbRunTransition(
            this._zone,
            this._elRef.nativeElement,
            (element: HTMLElement, anim: boolean) => {
                if (anim) {
                    reflow(element);
                }
                element.classList.add('show');
            },
            { animation: animation, runningTransition: 'continue' },
        );
        const dialogTransition$ = ngbRunTransition(this._zone, dialogEl.nativeElement, () => { }, {
            animation: animation,
            runningTransition: 'continue',
        });
        return zip(windowTransition$, dialogTransition$);
    }

    runHideTransition(animation: boolean, dialogEl: ElementRef<HTMLElement>): Observable<any[]> {
        const windowTransition$ = ngbRunTransition(
            this._zone,
            this._elRef.nativeElement,
            () => this._elRef.nativeElement.classList.remove('show'),
            { animation: animation, runningTransition: 'stop' },
        );
        const dialogTransition$ = ngbRunTransition(this._zone, dialogEl.nativeElement, () => { }, {
            animation: animation,
            runningTransition: 'stop',
        });
        return zip(windowTransition$, dialogTransition$);
    }

    bumpBackdrop(animation: boolean): void {
        ngbRunTransition(
            this._zone,
            this._elRef.nativeElement,
            ({ classList }) => {
                classList.add('modal-static');
                return () => classList.remove('modal-static');
            },
            { animation: animation, runningTransition: 'continue' },
        );
    }

    saveActiveElement(): void {
        this._elWithFocus = this._document.activeElement;
    }

    setFocus(): void {
        const nativeElement = this._elRef.nativeElement;
        if (!nativeElement.contains(this._document.activeElement)) {
            const autoFocusable = nativeElement.querySelector(`[ngbAutofocus]`) as HTMLElement;
            const focusableBoundary = getFocusableBoundaryElements(nativeElement)[0];

            const elementToFocus = autoFocusable || focusableBoundary || nativeElement;
            elementToFocus.focus();
        }
    }

    restoreFocus(): void {
        const body = this._document.body;
        const elWithFocus = this._elWithFocus;

        let elementToFocus;
        if (elWithFocus && elWithFocus['focus'] && body.contains(elWithFocus)) {
            elementToFocus = elWithFocus;
        } else {
            elementToFocus = body;
        }
        this._zone.runOutsideAngular(() => {
            setTimeout(() => elementToFocus.focus());
            this._elWithFocus = null;
        });
    }

    enableEventHandling(dialogEl: ElementRef<HTMLElement>, keyboard: boolean, backdrop: boolean | string, dismiss: (reason: any) => void, closed$: Subject<void>): void {
        const nativeElement = this._elRef.nativeElement;

        // Configura o subscription que será destruído quando o modal fechar
        closed$.pipe(take(1)).subscribe(() => { });

        this._zone.runOutsideAngular(() => {
            // ESC Keydown
            fromEvent<KeyboardEvent>(nativeElement, 'keydown')
                .pipe(
                    takeUntil(closed$), // subject do componente para limpeza
                    filter((e) => e.key === 'Escape'),
                )
                .subscribe((event) => {
                    if (keyboard) {
                        requestAnimationFrame(() => {
                            if (!event.defaultPrevented) {
                                this._zone.run(() => dismiss(ModalDismissReasons.ESC));
                            }
                        });
                    } else if (backdrop === 'static') {
                        this.bumpBackdrop(true);
                    }
                });

            // Mousedown/Mouseup para prevenir fechamento
            let preventClose = false;
            fromEvent<MouseEvent>(dialogEl.nativeElement, 'mousedown') // usa o dialogEl passado
                .pipe(
                    takeUntil(closed$),
                    tap(() => (preventClose = false)),
                    switchMap(() => fromEvent<MouseEvent>(nativeElement, 'mouseup').pipe(takeUntil(closed$), take(1))),
                    filter(({ target }) => nativeElement === target),
                )
                .subscribe(() => {
                    preventClose = true;
                });

            fromEvent<MouseEvent>(nativeElement, 'click')
                .pipe(takeUntil(closed$))
                .subscribe(({ target }) => {
                    if (nativeElement === target) {
                        if (backdrop === 'static') {
                            this.bumpBackdrop(true);
                        } else if (backdrop === true && !preventClose) {
                            this._zone.run(() => dismiss(ModalDismissReasons.BACKDROP_CLICK));
                        }
                    }
                    preventClose = false;
                });
        });
    }
}