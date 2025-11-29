import { inject, ElementRef, Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { ngbRunTransition } from '@ng-bootstrap/ng-bootstrap/utils';
import { ngbAlertFadingTransition } from './alert-transition';

// O acesso ao DOM é isolado neste serviço e não no componente
@Injectable({ providedIn: 'root' })
export class NgbAlertTransitionRunner {
    private _elementRef = inject(ElementRef<HTMLElement>);
    private _zone = inject(NgZone);

    run(animation: boolean): Observable<void> {
        return ngbRunTransition(this._zone, this._elementRef.nativeElement, ngbAlertFadingTransition, {
            animation: animation,
            runningTransition: 'continue',
        });
    }
}