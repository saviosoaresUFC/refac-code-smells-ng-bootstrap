import {
	ApplicationRef,
	ComponentRef,
	createComponent,
	EventEmitter,
	inject,
	Injectable,
	Injector,
	NgZone,
	DOCUMENT,
} from '@angular/core';
import { Subject } from 'rxjs';

import { isDefined, ngbFocusTrap, ScrollBar } from '@ng-bootstrap/ng-bootstrap/utils';
import { NgbModalBackdrop } from './modal-backdrop';
import { NgbModalOptions, NgbModalUpdatableOptions } from './modal-config';
import { NgbActiveModal, NgbModalRef } from './modal-ref';
import { NgbModalWindow } from './modal-window';
import { take } from 'rxjs/operators';
import { NgbModalContentInjector } from './modal-content-injector';

@Injectable({ providedIn: 'root' })
export class NgbModalStack {
	private _applicationRef = inject(ApplicationRef);
	private _injector = inject(Injector);
	private _document = inject(DOCUMENT);
	private _scrollBar = inject(ScrollBar);
	private _contentInjector = inject(NgbModalContentInjector);

	private _activeWindowCmptHasChanged = new Subject<void>();
	private _ariaHiddenValues: Map<Element, string | null> = new Map();
	private _scrollBarRestoreFn: null | (() => void) = null;
	private _modalRefs: NgbModalRef[] = [];
	private _windowCmpts: ComponentRef<NgbModalWindow>[] = [];
	private _activeInstances: EventEmitter<NgbModalRef[]> = new EventEmitter();

	constructor() {
		const ngZone = inject(NgZone);
		this._activeWindowCmptHasChanged.subscribe(() => {
			if (this._windowCmpts.length) {
				const activeWindowCmpt = this._windowCmpts[this._windowCmpts.length - 1];
				ngbFocusTrap(ngZone, activeWindowCmpt.location.nativeElement, this._activeWindowCmptHasChanged);
				this._revertAriaHidden();
				this._setAriaHidden(activeWindowCmpt.location.nativeElement);
			}
		});
	}

	private _restoreScrollBar() {
		const scrollBarRestoreFn = this._scrollBarRestoreFn;
		if (scrollBarRestoreFn) {
			this._scrollBarRestoreFn = null;
			scrollBarRestoreFn();
		}
	}

	private _hideScrollBar() {
		if (!this._scrollBarRestoreFn) {
			this._scrollBarRestoreFn = this._scrollBar.hide();
		}
	}

	open(contentInjector: Injector, content: any, options: NgbModalOptions): NgbModalRef {
		const containerEl =
			options.container instanceof HTMLElement
				? options.container
				: isDefined(options.container)
				  ? this._document.querySelector(options.container!)
				  : this._document.body;

		if (!containerEl) {
			throw new Error(`The specified modal container "${options.container || 'body'}" was not found in the DOM.`);
		}

		this._hideScrollBar();

		const activeModal = new NgbActiveModal();
		contentInjector = options.injector || contentInjector;

		// REFACTOR: Delegação para o novo serviço de injeção de conteúdo
		const contentRef = this._contentInjector.getContentRef(contentInjector, content, activeModal, options);

		let backdropCmptRef: ComponentRef<NgbModalBackdrop> | undefined =
			options.backdrop !== false ? this._attachBackdrop(containerEl) : undefined;
		let windowCmptRef: ComponentRef<NgbModalWindow> = this._attachWindowComponent(containerEl, contentRef.nodes);
		let ngbModalRef: NgbModalRef = new NgbModalRef(windowCmptRef, contentRef, backdropCmptRef, options.beforeDismiss);

		this._registerModalRef(ngbModalRef);
		this._registerWindowCmpt(windowCmptRef);

		ngbModalRef.hidden.pipe(take(1)).subscribe(() =>
			Promise.resolve(true).then(() => {
				if (!this._modalRefs.length) {
					this._document.body.classList.remove('modal-open');
					this._restoreScrollBar();
					this._revertAriaHidden();
				}
			}),
		);

		activeModal.close = (result: any) => {
			ngbModalRef.close(result);
		};
		activeModal.dismiss = (reason: any) => {
			ngbModalRef.dismiss(reason);
		};

		activeModal.update = (options: NgbModalUpdatableOptions) => {
			ngbModalRef.update(options);
		};

		ngbModalRef.update(options);
		if (this._modalRefs.length === 1) {
			this._document.body.classList.add('modal-open');
		}

		if (backdropCmptRef && backdropCmptRef.instance) {
			backdropCmptRef.changeDetectorRef.detectChanges();
		}
		windowCmptRef.changeDetectorRef.detectChanges();
		return ngbModalRef;
	}

	get activeInstances() {
		return this._activeInstances;
	}

	dismissAll(reason?: any) {
		this._modalRefs.forEach((ngbModalRef) => ngbModalRef.dismiss(reason));
	}

	hasOpenModals(): boolean {
		return this._modalRefs.length > 0;
	}

	private _attachBackdrop(containerEl: Element): ComponentRef<NgbModalBackdrop> {
		let backdropCmptRef = createComponent(NgbModalBackdrop, {
			environmentInjector: this._applicationRef.injector,
			elementInjector: this._injector,
		});
		this._applicationRef.attachView(backdropCmptRef.hostView);
		containerEl.appendChild(backdropCmptRef.location.nativeElement);
		return backdropCmptRef;
	}

	private _attachWindowComponent(containerEl: Element, projectableNodes: Node[][]): ComponentRef<NgbModalWindow> {
		let windowCmptRef = createComponent(NgbModalWindow, {
			environmentInjector: this._applicationRef.injector,
			elementInjector: this._injector,
			projectableNodes,
		});
		this._applicationRef.attachView(windowCmptRef.hostView);
		containerEl.appendChild(windowCmptRef.location.nativeElement);
		return windowCmptRef;
	}

	private _setAriaHidden(element: Element) {
		const parent = element.parentElement;
		if (parent && element !== this._document.body) {
			Array.from(parent.children).forEach((sibling) => {
				if (sibling !== element && sibling.nodeName !== 'SCRIPT') {
					this._ariaHiddenValues.set(sibling, sibling.getAttribute('aria-hidden'));
					sibling.setAttribute('aria-hidden', 'true');
				}
			});

			this._setAriaHidden(parent);
		}
	}

	private _revertAriaHidden() {
		this._ariaHiddenValues.forEach((value, element) => {
			if (value) {
				element.setAttribute('aria-hidden', value);
			} else {
				element.removeAttribute('aria-hidden');
			}
		});
		this._ariaHiddenValues.clear();
	}

	private _registerModalRef(ngbModalRef: NgbModalRef) {
		const unregisterModalRef = () => {
			const index = this._modalRefs.indexOf(ngbModalRef);
			if (index > -1) {
				this._modalRefs.splice(index, 1);
				this._activeInstances.emit(this._modalRefs);
			}
		};
		this._modalRefs.push(ngbModalRef);
		this._activeInstances.emit(this._modalRefs);
		ngbModalRef.result.then(unregisterModalRef, unregisterModalRef);
	}

	private _registerWindowCmpt(ngbWindowCmpt: ComponentRef<NgbModalWindow>) {
		this._windowCmpts.push(ngbWindowCmpt);
		this._activeWindowCmptHasChanged.next();

		ngbWindowCmpt.onDestroy(() => {
			const index = this._windowCmpts.indexOf(ngbWindowCmpt);
			if (index > -1) {
				this._windowCmpts.splice(index, 1);
				this._activeWindowCmptHasChanged.next();
			}
		});
	}
}