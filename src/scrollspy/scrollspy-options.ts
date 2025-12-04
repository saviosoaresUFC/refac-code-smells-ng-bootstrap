import { ChangeDetectorRef } from '@angular/core';
import { NgbScrollSpyRef } from './scrollspy';

export type NgbScrollSpyProcessChanges = (
	state: {
		entries: IntersectionObserverEntry[];
		rootElement: HTMLElement;
		fragments: Set<Element>;
		scrollSpy: NgbScrollSpyRef; // REFACTOR: Usando interface em vez da classe concreta
		options: NgbScrollSpyOptions;
	},
	changeActive: (active: string) => void,
	context: object,
) => void;

/**
 * Options passed to the `NgbScrollSpyService.start()` method for scrollspy initialization.
 *
 * It contains a subset of the `IntersectionObserverInit` options, as well additional optional properties
 * like `changeDetectorRef` or `fragments`
 *
 * @since 15.1.0
 */
export interface NgbScrollSpyOptions extends Pick<IntersectionObserverInit, 'root' | 'rootMargin' | 'threshold'> {
	/**
	 * An optional reference to the change detector, that should be marked for check when active fragment changes.
	 * If it is not provided, the service will try to get it from the DI. Ex. when using the `ngbScrollSpy` directive,
	 * it will mark for check the directive's host component.
	 *
	 * `.markForCheck()` will be called on the change detector when the active fragment changes.
	 */
	changeDetectorRef?: ChangeDetectorRef;

	/**
	 * An optional initial fragment to scroll to when the service starts.
	 */
	initialFragment?: string | HTMLElement;

	/**
	 * An optional list of fragments to observe when the service starts.
	 * You can alternatively use `.addFragment()` to add fragments.
	 */
	fragments?: (string | HTMLElement)[];

	/**
	 * An optional function that is called when the `IntersectionObserver` detects a change.
	 * It is used to determine if currently active fragment should be changed.
	 *
	 * You can override this function to provide your own scrollspy logic.
	 * It provides:
	 * - a scrollspy `state` (observer entries, root element, fragments, scrollSpy instance, etc.)
	 * - a `changeActive` function that should be called with the new active fragment
	 * - a `context` that is persisted between calls
	 */
	processChanges?: NgbScrollSpyProcessChanges;

	/**
	 * An optional `IntersectionObserver` root element. If not provided, the document element will be used.
	 */
	root?: HTMLElement;

	/**
	 * An optional `IntersectionObserver` margin for the root element.
	 */
	rootMargin?: string;

	/**
	 * An optional default scroll behavior to use when using the `.scrollTo()` method.
	 */
	scrollBehavior?: 'auto' | 'smooth';

	/**
	 * An optional `IntersectionObserver` threshold.
	 */
	threshold?: number | number[];
}

/**
 * Scroll options passed to the `.scrollTo()` method.
 * An extension of the standard `ScrollOptions` interface.
 *
 * @since 15.1.0
 */
export interface NgbScrollToOptions extends ScrollOptions {
	/**
	 * Scroll behavior as defined in the `ScrollOptions` interface.
	 */
	behavior?: 'auto' | 'smooth';
}