import { createPopperLite, Instance } from '@popperjs/core';
import { NgbRTL } from './rtl';
import { inject } from '@angular/core';
import { getPopperOptions, PositioningOptions } from './positioning-options';

// Re-exporta tipos para manter compatibilidade com quem importava daqui
export { Placement, PlacementArray, PositioningOptions } from './positioning-options';

function noop(arg) {
	return arg;
}

export function ngbPositioning() {
	const rtl = inject(NgbRTL);
	let popperInstance: Instance | null = null;

	return {
		createPopper(positioningOption: PositioningOptions) {
			if (!popperInstance) {
				const updatePopperOptions = positioningOption.updatePopperOptions || noop;
				let popperOptions = updatePopperOptions(getPopperOptions(positioningOption, rtl));
				popperInstance = createPopperLite(
					positioningOption.hostElement,
					positioningOption.targetElement,
					popperOptions,
				);
			}
		},
		update() {
			if (popperInstance) {
				popperInstance.update();
			}
		},
		setOptions(positioningOption: PositioningOptions) {
			if (popperInstance) {
				const updatePopperOptions = positioningOption.updatePopperOptions || noop;
				let popperOptions = updatePopperOptions(getPopperOptions(positioningOption, rtl));
				popperInstance.setOptions(popperOptions);
			}
		},
		destroy() {
			if (popperInstance) {
				popperInstance.destroy();
				popperInstance = null;
			}
		},
	};
}