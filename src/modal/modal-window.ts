import {
	afterNextRender,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';

import { Observable, Subject } from 'rxjs';
import {
	isDefined,
	isString,
} from '@ng-bootstrap/ng-bootstrap/utils';
import { NgbModalUpdatableOptions } from './modal-config';
import { NgbModalWindowDomHelper } from './NgbModalWindowDomHelper';

const WINDOW_ATTRIBUTES: string[] = [
	'animation',
	'ariaLabelledBy',
	'ariaDescribedBy',
	'backdrop',
	'centered',
	'fullscreen',
	'keyboard',
	'role',
	'scrollable',
	'size',
	'windowClass',
	'modalDialogClass',
] as const;

@Component({
	selector: 'ngb-modal-window',
	host: {
		'[class]': '"modal d-block" + (windowClass ? " " + windowClass : "")',
		'[class.fade]': 'animation',
		tabindex: '-1',
		'[attr.aria-modal]': 'true',
		'[attr.aria-labelledby]': 'ariaLabelledBy',
		'[attr.aria-describedby]': 'ariaDescribedBy',
		'[attr.role]': 'role',
	},
	template: `
		<div
			#dialog
			[class]="
				'modal-dialog' +
				(size ? ' modal-' + size : '') +
				(centered ? ' modal-dialog-centered' : '') +
				fullscreenClass +
				(scrollable ? ' modal-dialog-scrollable' : '') +
				(modalDialogClass ? ' ' + modalDialogClass : '')
			"
			role="document"
		>
			<div class="modal-content"><ng-content /></div>
		</div>
	`,
	encapsulation: ViewEncapsulation.None,
	styleUrl: './modal.scss',
})
export class NgbModalWindow implements OnInit, OnDestroy {
	private _domHelper = inject(NgbModalWindowDomHelper);
	private _injector = inject(Injector);
	private _cdRef = inject(ChangeDetectorRef);

	private _closed$ = new Subject<void>();

	@ViewChild('dialog', { static: true }) private _dialogEl: ElementRef<HTMLElement>;

	@Input() animation: boolean;
	@Input() ariaLabelledBy: string;
	@Input() ariaDescribedBy: string;
	@Input() backdrop: boolean | string = true;
	@Input() centered: string;
	@Input() fullscreen: string | boolean;
	@Input() keyboard = true;
	@Input() role: string = 'dialog';
	@Input() scrollable: string;
	@Input() size: string;
	@Input() windowClass: string;
	@Input() modalDialogClass: string;

	@Output('dismiss') dismissEvent = new EventEmitter();

	shown = new Subject<void>();
	hidden = new Subject<void>();

	get fullscreenClass(): string {
		return this.fullscreen === true
			? ' modal-fullscreen'
			: isString(this.fullscreen)
				? ` modal-fullscreen-${this.fullscreen}-down`
				: '';
	}

	dismiss(reason): void {
		this.dismissEvent.emit(reason);
	}

	ngOnInit() {
		this._domHelper.saveActiveElement();
		afterNextRender({ mixedReadWrite: () => this._show() }, { injector: this._injector });
	}

	ngOnDestroy() {
		this._disableEventHandling();
	}

	hide(): Observable<any> {
		const transitions$ = this._domHelper.runHideTransition(this.animation, this._dialogEl);

		transitions$.subscribe(() => {
			this.hidden.next();
			this.hidden.complete();
		});

		this._disableEventHandling();
		this._domHelper.restoreFocus();

		return transitions$;
	}

	updateOptions(options: NgbModalUpdatableOptions): void {
		WINDOW_ATTRIBUTES.forEach((optionName: string) => {
			if (isDefined(options[optionName])) {
				this[optionName] = options[optionName];
			}
		});
		this._cdRef.markForCheck();
	}

	private _show() {
		this._domHelper.runShowTransition(this.animation, this._dialogEl).subscribe(() => {
			this.shown.next();
			this.shown.complete();
		});

		this._domHelper.enableEventHandling(
        this._dialogEl, 
        this.keyboard, 
        this.backdrop, 
        (reason) => this.dismiss(reason), // dismiss como callback
        this._closed$ //subject de limpeza
    );
		this._domHelper.setFocus();
	}

	private _disableEventHandling() {
		this._closed$.next();
	}

	private _bumpBackdrop() {
		if (this.backdrop === 'static') {
			this._domHelper.bumpBackdrop(this.animation);
		}
	}
}
