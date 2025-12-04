import { getValueInRange } from '@ng-bootstrap/ng-bootstrap/utils';

/**
 * The context for the custom star display template defined in the `starTemplate`.
 */
export interface StarTemplateContext {
	/**
	 * The star fill percentage, an integer in the `[0, 100]` range.
	 */
	fill: number;

	/**
	 * Index of the star, starts with `0`.
	 */
	index: number;
}

export function createStarContexts(max: number): StarTemplateContext[] {
	return Array.from({ length: max }, (v, k) => ({ fill: 0, index: k }));
}

export function updateStars(contexts: StarTemplateContext[], value: number): void {
	contexts.forEach((context, index) => {
		context.fill = Math.round(getValueInRange(value - index, 1, 0) * 100);
	});
}

export function getNextValueFromKey(key: string, rate: number, max: number): number | null {
	switch (key) {
		case 'ArrowDown':
		case 'ArrowLeft':
			return rate - 1;
		case 'ArrowUp':
		case 'ArrowRight':
			return rate + 1;
		case 'Home':
			return 0;
		case 'End':
			return max;
		default:
			return null;
	}
}