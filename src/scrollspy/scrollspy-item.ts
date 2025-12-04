import { ChangeDetectorRef, DestroyRef, Directive, inject, Input, OnInit } from '@angular/core';
import { NgbScrollSpyService } from './scrollspy.service';
import { isString } from '@ng-bootstrap/ng-bootstrap/utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbScrollToOptions } from './scrollspy-options';
import { NgbScrollSpyRef } from './scrollspy-ref';
import { NgbScrollSpyMenu } from './scrollspy-menu';
import { NgbScrollSpy } from './scrollspy';

/**
 * A helper directive to that links menu items and fragments together.
 *
 * It will automatically add the `.active` class to the menu item when the associated fragment becomes active.
 *
 * @since 15.1.0
 */
@Directive({
	selector: '[ngbScrollSpyItem]',
	exportAs: 'ngbScrollSpyItem',
	host: {
		'[class.active]': 'isActive()',
		'(click)': 'scrollTo();',
	},
})
export class NgbScrollSpyItem implements OnInit {
	private _changeDetector = inject(ChangeDetectorRef);
	private _scrollSpyMenu = inject(NgbScrollSpyMenu, { optional: true });
	private _scrollSpyAPI: NgbScrollSpyRef = this._scrollSpyMenu ?? inject(NgbScrollSpyService);
	private _destroyRef = inject(DestroyRef);

	private _isActive = false;

	/**
	 * References the scroll spy directive, the id of the associated fragment and the parent menu item.
	 *
	 * Can be used like:
	 * - `ngbScrollSpyItem="fragmentId"`
	 * - `[ngbScrollSpyItem]="scrollSpy" fragment="fragmentId"
	 * - `[ngbScrollSpyItem]="[scrollSpy, 'fragmentId']"` parent="parentId"`
	 * - `[ngbScrollSpyItem]="[scrollSpy, 'fragmentId', 'parentId']"`
	 *
	 * As well as together with `[fragment]` and `[parent]` inputs.
	 */
	@Input('ngbScrollSpyItem') set data(data: NgbScrollSpy | string | [NgbScrollSpy, string, string?]) {
		if (Array.isArray(data)) {
			this._scrollSpyAPI = data[0];
			this.fragment = data[1];
			this.parent ??= data[2];
		} else if (data instanceof NgbScrollSpy) {
			this._scrollSpyAPI = data;
		} else if (isString(data)) {
			this.fragment = data;
		}
	}

	/**
	 * The id of the associated fragment.
	 */
	@Input() fragment: string;

	/**
	 * The id of the parent scroll spy menu item.
	 */
	@Input() parent: string | undefined;

	ngOnInit(): void {
		// if it is not a part of a bigger menu, it should handle activation itself
		if (!this._scrollSpyMenu) {
			this._scrollSpyAPI.active$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((active: string) => {
				if (active === this.fragment) {
					this._activate();
				} else {
					this._deactivate();
				}
				this._changeDetector.markForCheck();
			});
		}
	}

	/**
	 * @internal
	 */
	_activate(): void {
		this._isActive = true;
		if (this._scrollSpyMenu) {
			this._scrollSpyMenu.getItem(this.parent ?? '')?._activate();
		}
	}

	/**
	 * @internal
	 */
	_deactivate(): void {
		this._isActive = false;
		if (this._scrollSpyMenu) {
			this._scrollSpyMenu.getItem(this.parent ?? '')?._deactivate();
		}
	}

	/**
	 * Returns `true`, if the associated fragment is active.
	 */
	isActive(): boolean {
		return this._isActive;
	}

	/**
	 * Scrolls to the associated fragment.
	 */
	scrollTo(options?: NgbScrollToOptions): void {
		this._scrollSpyAPI.scrollTo(this.fragment, options);
	}
}