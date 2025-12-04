import { AfterViewInit, Directive, ElementRef, inject, Input, Output } from '@angular/core';
import { NgbScrollSpyService } from './scrollspy.service';
import { Observable } from 'rxjs';
import { NgbScrollSpyRef } from './scrollspy-ref';
import { NgbScrollSpyFragment } from './scrollspy-fragment';
import { NgbScrollSpyProcessChanges, NgbScrollToOptions } from './scrollspy-options';

/**
 * A directive to put on a scrollable container.
 *
 * It will instantiate a [`NgbScrollSpyService`](#/components/scrollspy/api#NgbScrollSpyService).
 *
 * @since 15.1.0
 */
@Directive({
	selector: '[ngbScrollSpy]',
	exportAs: 'ngbScrollSpy',
	host: {
		tabindex: '0',
		style: 'overflow-y: auto',
	},
	providers: [NgbScrollSpyService],
})
export class NgbScrollSpy implements NgbScrollSpyRef, AfterViewInit {
	static ngAcceptInputType_scrollBehavior: string;

	private _initialFragment: string | null = null;
	private _service = inject(NgbScrollSpyService);
	private _nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

	/**
	 * A function that is called when the `IntersectionObserver` detects a change.
	 *
	 * See [`NgbScrollSpyOptions`](#/components/scrollspy/api#NgbScrollSpyOptions) for more details.
	 */
	@Input() processChanges: NgbScrollSpyProcessChanges;

	/**
	 * An `IntersectionObserver` root margin.
	 */
	@Input() rootMargin: string;

	/**
	 * The scroll behavior for the `.scrollTo()` method.
	 */
	@Input() scrollBehavior: 'auto' | 'smooth';

	/**
	 * An `IntersectionObserver` threshold.
	 */
	@Input() threshold: number | number[];

	@Input() set active(fragment: string) {
		this._initialFragment = fragment;
		this.scrollTo(fragment);
	}

	/**
	 * An event raised when the active section changes.
	 *
	 * Payload is the id of the new active section, empty string if none.
	 */
	@Output() activeChange = this._service.active$;

	/**
	 * Getter/setter for the currently active fragment id.
	 */
	get active(): string {
		return this._service.active;
	}

	/**
	 * Returns an observable that emits currently active section id.
	 */
	get active$(): Observable<string> {
		return this._service.active$;
	}

	ngAfterViewInit(): void {
		this._service.start({
			processChanges: this.processChanges,
			root: this._nativeElement,
			rootMargin: this.rootMargin,
			threshold: this.threshold,
			...(this._initialFragment && { initialFragment: this._initialFragment }),
		});
	}

	/**
	 * @internal
	 */
	_registerFragment(fragment: NgbScrollSpyFragment): void {
		this._service.observe(fragment.id);
	}

	/**
	 * @internal
	 */
	_unregisterFragment(fragment: NgbScrollSpyFragment): void {
		this._service.unobserve(fragment.id);
	}

	/**
	 * Scrolls to a fragment that is identified by the `ngbScrollSpyFragment` directive.
	 * An id or an element reference can be passed.
	 */
	scrollTo(fragment: string | HTMLElement, options?: NgbScrollToOptions): void {
		this._service.scrollTo(fragment, {
			...(this.scrollBehavior && { behavior: this.scrollBehavior }),
			...options,
		});
	}
}