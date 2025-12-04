import { AfterViewInit, ContentChildren, DestroyRef, Directive, inject, Input, QueryList } from '@angular/core';
import { NgbScrollSpyService } from './scrollspy.service';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbScrollSpyRef } from './scrollspy-ref';
import { NgbScrollSpy } from './scrollspy';
import { NgbScrollSpyItem } from './scrollspy-item';
import { NgbScrollToOptions } from './scrollspy-options';

/**
 * An optional scroll spy menu directive to build hierarchical menus
 * and simplify the [`NgbScrollSpyItem`](#/components/scrollspy/api#NgbScrollSpyItem) configuration.
 *
 * @since 15.1.0
 */
@Directive({
	selector: '[ngbScrollSpyMenu]',
})
export class NgbScrollSpyMenu implements NgbScrollSpyRef, AfterViewInit {
	private _scrollSpyRef: NgbScrollSpyRef = inject(NgbScrollSpyService);
	private _destroyRef = inject(DestroyRef);
	private _map = new Map<string, NgbScrollSpyItem>();
	private _lastActiveItem: NgbScrollSpyItem | null = null;

	@ContentChildren(NgbScrollSpyItem, { descendants: true }) private _items: QueryList<NgbScrollSpyItem>;

	@Input('ngbScrollSpyMenu') set scrollSpy(scrollSpy: NgbScrollSpy) {
		this._scrollSpyRef = scrollSpy;
	}

	get active(): string {
		return this._scrollSpyRef.active;
	}
	get active$(): Observable<string> {
		return this._scrollSpyRef.active$;
	}
	scrollTo(fragment: string, options?: NgbScrollToOptions): void {
		this._scrollSpyRef.scrollTo(fragment, options);
	}

	getItem(id: string): NgbScrollSpyItem | undefined {
		return this._map.get(id);
	}

	ngAfterViewInit() {
		this._items.changes.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => this._rebuildMap());
		this._rebuildMap();

		this._scrollSpyRef.active$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((activeId) => {
			this._lastActiveItem?._deactivate();
			const item = this._map.get(activeId);
			if (item) {
				item._activate();
				this._lastActiveItem = item;
			}
		});
	}

	private _rebuildMap() {
		this._map.clear();
		for (let item of this._items) {
			this._map.set(item.fragment, item);
		}
	}
}