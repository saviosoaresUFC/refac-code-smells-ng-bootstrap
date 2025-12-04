import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, EventEmitter, forwardRef,
	inject, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewEncapsulation,
} from '@angular/core';
import { NgbRatingConfig } from './rating-config';
import { getValueInRange } from '@ng-bootstrap/ng-bootstrap/utils';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';

/**
 * A directive that helps visualising and interacting with a star rating bar.
 */
@Component({
	selector: 'ngb-rating',
	imports: [NgTemplateOutlet],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	host: {
		class: 'd-inline-flex',
		'[tabindex]': 'disabled ? -1 : tabindex',
		role: 'slider',
		'aria-valuemin': '0',
		'[attr.aria-valuemax]': 'max',
		'[attr.aria-valuenow]': 'nextRate',
		'[attr.aria-valuetext]': 'ariaValueText(nextRate, max)',
		'[attr.aria-readonly]': 'readonly && !disabled ? true : null',
		'[attr.aria-disabled]': 'disabled ? true : null',
		'(blur)': 'handleBlur()',
		'(keydown)': 'handleKeyDown($event)',
		'(mouseleave)': 'reset()',
	},
	template: `
		<ng-template #t let-fill="fill">{{ fill === 100 ? '&#9733;' : '&#9734;' }}</ng-template>
		@for (_ of contexts; track _; let index = $index) {
			<span class="visually-hidden">({{ index < nextRate ? '*' : ' ' }})</span>
			<span
				(mouseenter)="enter(index + 1)"
				(click)="handleClick(index + 1)"
				[style.cursor]="isInteractive() ? 'pointer' : 'default'"
			>
				<ng-template
					[ngTemplateOutlet]="starTemplate || starTemplateFromContent || t"
					[ngTemplateOutletContext]="contexts[index]"
				/>
			</span>
		}
	`,
	providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbRating), multi: true }],
})
export class NgbRating implements ControlValueAccessor, OnInit, OnChanges {
	contexts: StarTemplateContext[] = [];
	nextRate: number;

	private _config = inject(NgbRatingConfig);
	
	private _changeDetectorRef = inject(ChangeDetectorRef);

	@Input() disabled = false;

	@Input() max = this._config.max;

	@Input() rate: number;

	@Input() readonly = this._config.readonly;

	@Input() resettable = this._config.resettable;

	@Input() starTemplate: TemplateRef<StarTemplateContext>;
	
	@ContentChild(TemplateRef, { static: false }) starTemplateFromContent: TemplateRef<StarTemplateContext>;

	@Input() tabindex = this._config.tabindex;

	@Input() ariaValueText(current: number, max: number) {
		return `${current} out of ${max}`;
	}

	@Output() hover = new EventEmitter<number>();

	@Output() leave = new EventEmitter<number>();

	@Output() rateChange = new EventEmitter<number>(true);

	onChange = (_: any) => {};
	onTouched = () => {};

	isInteractive(): boolean {
		return !this.readonly && !this.disabled;
	}

	enter(value: number): void {
		if (this.isInteractive()) {
			this._updateState(value);
		}
		this.hover.emit(value);
	}

	handleBlur() {
		this.onTouched();
	}

	handleClick(value: number) {
		if (this.isInteractive()) {
			this.update(this.resettable && this.rate === value ? 0 : value);
		}
	}

	handleKeyDown(event: KeyboardEvent) {
		// REFACTOR: Lógica de decisão movida para helper externo
		const nextValue = getNextValueFromKey(event.key, this.rate, this.max);
		if (nextValue !== null) {
			this.update(nextValue);
			event.preventDefault();
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['rate']) {
			this.update(this.rate);
		}
		if (changes['max']) {
			this._updateMax();
		}
	}

	ngOnInit(): void {
		this.contexts = createStarContexts(this.max);
		this._updateState(this.rate);
	}

	registerOnChange(fn: (value: any) => any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => any): void {
		this.onTouched = fn;
	}

	reset(): void {
		this.leave.emit(this.nextRate);
		this._updateState(this.rate);
	}

	setDisabledState(isDisabled: boolean) {
		this.disabled = isDisabled;
	}

	update(value: number, internalChange = true): void {
		const newRate = getValueInRange(value, this.max, 0);
		if (this.isInteractive() && this.rate !== newRate) {
			this.rate = newRate;
			this.rateChange.emit(this.rate);
		}
		if (internalChange) {
			this.onChange(this.rate);
			this.onTouched();
		}
		this._updateState(this.rate);
	}

	writeValue(value) {
		this.update(value, false);
		this._changeDetectorRef.markForCheck();
	}

	private _updateState(nextValue: number) {
		this.nextRate = nextValue;
		// REFACTOR: Lógica de preenchimento movida para helper externo
		updateStars(this.contexts, nextValue);
	}

	private _updateMax() {
		if (this.max > 0) {
			this.contexts = createStarContexts(this.max);
			this.update(this.rate);
		}
	}
}