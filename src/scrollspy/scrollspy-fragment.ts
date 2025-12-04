import { AfterViewInit, DestroyRef, Directive, inject, Input } from '@angular/core';
import { NgbScrollSpy } from './scrollspy';

/**
 * A directive to put on a fragment observed inside a scrollspy container.
 *
 * @since 15.1.0
 */
@Directive({
	selector: '[ngbScrollSpyFragment]',
	host: {
		'[id]': 'id',
	},
})
export class NgbScrollSpyFragment implements AfterViewInit {
	private _destroyRef = inject(DestroyRef);
	// REFACTOR: Injeção da diretiva principal
	private _scrollSpy = inject(NgbScrollSpy);

	/**
	 * The unique id of the fragment.
	 * It must be a string unique to the document, as it will be set as the id of the element.
	 */
	@Input('ngbScrollSpyFragment') id: string;

	ngAfterViewInit() {
		this._scrollSpy._registerFragment(this);
		this._destroyRef.onDestroy(() => this._scrollSpy._unregisterFragment(this));
	}
}