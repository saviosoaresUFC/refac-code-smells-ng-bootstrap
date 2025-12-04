import { ChangeDetectorRef, inject, Injectable, NgZone, OnDestroy, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NgbScrollSpyRef } from './scrollspy';
import { distinctUntilChanged } from 'rxjs/operators';
import { NgbScrollSpyConfig } from './scrollspy-config';
import { isPlatformBrowser } from '@angular/common';
import { toFragmentElement } from './scrollspy.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbScrollSpyOptions, NgbScrollToOptions } from './scrollspy-options';

const MATCH_THRESHOLD = 3;

/**
 * A scrollspy service that allows tracking of elements scrolling in and out of view.
 *
 * It can be instantiated manually, or automatically by the `ngbScrollSpy` directive.
 *
 * @since 15.1.0
 */
@Injectable({
	providedIn: 'root',
})
export class NgbScrollSpyService implements NgbScrollSpyRef, OnDestroy {
	private _observer: IntersectionObserver | null = null;

	private _containerElement: HTMLElement | null = null;
	private _fragments = new Set<Element>();
	private _preRegisteredFragments = new Set<string | HTMLElement>();

	private _active$ = new Subject<string>();
	private _distinctActive$ = this._active$.pipe(distinctUntilChanged());
	private _active = '';

	private _config = inject(NgbScrollSpyConfig);
	private _document = inject(DOCUMENT);
	private _platformId = inject(PLATFORM_ID);
	private _scrollBehavior = this._config.scrollBehavior;
	private _diChangeDetectorRef = inject(ChangeDetectorRef, { optional: true });
	private _changeDetectorRef = this._diChangeDetectorRef;
	private _zone = inject(NgZone);

	constructor() {
		this._distinctActive$.pipe(takeUntilDestroyed()).subscribe((active) => {
			this._active = active;
			this._changeDetectorRef?.markForCheck();
		});
	}

	get active(): string {
		return this._active;
	}


	get active$(): Observable<string> {
		return this._distinctActive$;
	}

	start(options?: NgbScrollSpyOptions) {
		if (isPlatformBrowser(this._platformId)) {
			this._cleanup();

			const { root, rootMargin, scrollBehavior, threshold, fragments, changeDetectorRef, processChanges } = {
				...options,
			};
			this._containerElement = root ?? this._document.documentElement;
			this._changeDetectorRef = changeDetectorRef ?? this._diChangeDetectorRef;
			this._scrollBehavior = scrollBehavior ?? this._config.scrollBehavior;
			const processChangesFn = processChanges ?? this._config.processChanges;

			const context = {};
			this._observer = new IntersectionObserver(
				(entries) =>
					processChangesFn(
						{
							entries,
							rootElement: this._containerElement!,
							fragments: this._fragments,
							scrollSpy: this,
							options: { ...options },
						},
						(active: string) => this._active$.next(active),
						context,
					),
				{
					root: root ?? this._document,
					...(rootMargin && { rootMargin }),
					...(threshold && { threshold }),
				},
			);

			for (const element of [...this._preRegisteredFragments, ...(fragments ?? [])]) {
				this.observe(element);
			}

			this._preRegisteredFragments.clear();
		}
	}

	stop() {
		this._cleanup();
		this._active$.next('');
	}
	scrollTo(fragment: string | HTMLElement, options?: NgbScrollToOptions) {
		const { behavior } = { behavior: this._scrollBehavior, ...options };

		if (this._containerElement) {
			const fragmentElement = toFragmentElement(this._containerElement, fragment);

			if (fragmentElement) {
				const heightPx = fragmentElement.offsetTop - this._containerElement.offsetTop;

				this._containerElement.scrollTo({ top: heightPx, behavior });

				let lastOffset = this._containerElement.scrollTop;
				let matchCounter = 0;

				const containerElement = this._containerElement;
				this._zone.runOutsideAngular(() => {
					const updateActiveWhenScrollingIsFinished = () => {
						const sameOffsetAsLastTime = lastOffset === containerElement.scrollTop;

						if (sameOffsetAsLastTime) {
							matchCounter++;
						} else {
							matchCounter = 0;
						}

						if (!sameOffsetAsLastTime || (sameOffsetAsLastTime && matchCounter < MATCH_THRESHOLD)) {
							lastOffset = containerElement.scrollTop;

							requestAnimationFrame(updateActiveWhenScrollingIsFinished);
						} else {
							this._zone.run(() => this._active$.next(fragmentElement.id));
						}
					};
					requestAnimationFrame(updateActiveWhenScrollingIsFinished);
				});
			}
		}
	}

	observe(fragment: string | HTMLElement) {
		if (!this._observer) {
			this._preRegisteredFragments.add(fragment);
			return;
		}

		const fragmentElement = toFragmentElement(this._containerElement, fragment);

		if (fragmentElement && !this._fragments.has(fragmentElement)) {
			this._fragments.add(fragmentElement);
			this._observer.observe(fragmentElement);
		}
	}

	unobserve(fragment: string | HTMLElement) {
		if (!this._observer) {
			this._preRegisteredFragments.delete(fragment);
			return;
		}

		const fragmentElement = toFragmentElement(this._containerElement, fragment);

		if (fragmentElement) {
			this._fragments.delete(fragmentElement);
			this._observer.disconnect();

			for (const fragment of this._fragments) {
				this._observer.observe(fragment);
			}
		}
	}

	ngOnDestroy() {
		this._cleanup();
	}

	private _cleanup() {
		this._fragments.clear();
		this._observer?.disconnect();
		this._changeDetectorRef = this._diChangeDetectorRef;
		this._scrollBehavior = this._config.scrollBehavior;
		this._observer = null;
		this._containerElement = null;
	}
}