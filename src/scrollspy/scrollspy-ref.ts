import { Observable } from 'rxjs';
import { NgbScrollToOptions } from './scrollspy-options';

/**
 * Common interface for the scroll spy API.
 *
 * @internal
 */
export interface NgbScrollSpyRef {
	get active(): string;
	get active$(): Observable<string>;
	scrollTo(fragment: string | HTMLElement, options?: NgbScrollToOptions): void;
}