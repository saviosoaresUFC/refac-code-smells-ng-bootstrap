import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Injectable } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NgbDatepickerModule, NgbDateStruct } from './datepicker.module';
import { NgbDatepickerI18n, NgbDatepickerI18nDefault } from './datepicker-i18n';
import { NgbDatepicker } from './datepicker';
import { getMonthSelect, getYearSelect } from '../test/datepicker/common';

describe('ngb-datepicker integration i18n', () => {
	describe('i18n', () => {
		const ALPHABET = 'ABCDEFGHIJKLMNOPRSTQUVWXYZ';

		@Injectable()
		class CustomI18n extends NgbDatepickerI18nDefault {
			// alphabetic months: Jan -> A, Feb -> B, etc
			getMonthShortName(month: number) {
				return ALPHABET[month - 1];
			}

			// alphabetic months: Jan -> A, Feb -> B, etc
			getMonthFullName(month: number) {
				return ALPHABET[month - 1];
			}

			// alphabetic days: 1 -> A, 2 -> B, etc
			getDayNumerals(date: NgbDateStruct) {
				return ALPHABET[date.day - 1];
			}

			// alphabetic week numbers: 1 -> A, 2 -> B, etc
			getWeekNumerals(week: number) {
				return ALPHABET[week - 1];
			}

			// reversed years: 1998 -> 9881
			getYearNumerals(year: number) {
				return `${year}`.split('').reverse().join('');
			}

			// alphabetic week short name
			getWeekLabel() {
				return ALPHABET.substring(0, 2);
			}
		}

		let fixture: ComponentFixture<TestComponent>;

		beforeEach(() => {
			TestBed.overrideComponent(TestComponent, {
				set: {
					template: `
            <ngb-datepicker [startDate]="{year: 2018, month: 1}"
                            [minDate]="{year: 2017, month: 1, day: 1}"
                            [maxDate]="{year: 2019, month: 12, day: 31}"
                            [showWeekNumbers]="true"
                            [displayMonths]="2"
            ></ngb-datepicker>`,
					providers: [{ provide: NgbDatepickerI18n, useClass: CustomI18n }],
				},
			});

			fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();
		});

		it('should allow overriding month names', () => {
			const monthOptions = getMonthSelect(fixture.nativeElement).querySelectorAll('option');
			const months = Array.from(monthOptions).map((o) => o.innerHTML);
			expect(months.join('')).toEqual(ALPHABET.slice(0, 12));
		});

		it('should allow overriding week number numerals', () => {
			// month view that displays JAN 2018 starts directly with week 01
			const weekNumberElements = fixture.nativeElement.querySelectorAll('.ngb-dp-week-number');
			const weekNumbers = Array.from(weekNumberElements).map((o: HTMLElement) => o.innerHTML);
			expect(weekNumbers.slice(0, 6).join('')).toEqual(ALPHABET.slice(0, 6));
		});

		it('should allow overriding day numerals', () => {
			// month view that displays JAN 2018 starts directly with 01 JAN
			const daysElements = fixture.nativeElement.querySelectorAll('.ngb-dp-day > div');
			const days = Array.from(daysElements).map((o: HTMLElement) => o.innerHTML);
			expect(days.slice(0, 26).join('')).toEqual(ALPHABET);
		});

		it('should allow overriding year numerals', () => {
			// we have only 2017, 2018 and 2019 in the select box
			const yearOptions = getYearSelect(fixture.nativeElement).querySelectorAll('option');
			const years = Array.from(yearOptions).map((o) => o.innerText);
			expect(years).toEqual(['7102', '8102', '9102']);
		});

		it('should allow overriding year and month numerals for multiple months', () => {
			// we have JAN 2018 and FEB 2018 -> A 8102 and B 8102
			const monthNameElements = fixture.nativeElement.querySelectorAll('.ngb-dp-month-name');
			const monthNames = Array.from(monthNameElements).map((o: HTMLElement) => o.innerText.trim());
			expect(monthNames).toEqual(['A 8102', 'B 8102']);
		});

		it('should allow overriding week label', () => {
			const weekLabelElement = (fixture.nativeElement as HTMLElement).querySelector('.ngb-dp-showweek') as HTMLElement;
			const weekLabel = weekLabelElement.innerText.trim();
			expect(weekLabel).toEqual(ALPHABET.substring(0, 2));
		});

		it('should allow accessing i18n via a getter ', () => {
			const dp = fixture.debugElement.query(By.directive(NgbDatepicker)).injector.get(NgbDatepicker);
			expect(dp.i18n).toBeDefined();
			expect(dp.i18n.getMonthFullName(1)).toEqual('A');
		});
	});

	describe('i18n-month-label', () => {
		@Injectable()
		class CustomI18n extends NgbDatepickerI18nDefault {
			getMonthLabel(date: NgbDateStruct): string {
				return `${date.month}-${date.year}`;
			}
		}

		let fixture: ComponentFixture<TestComponent>;

		beforeEach(() => {
			TestBed.overrideComponent(TestComponent, {
				set: {
					template: `
            <ngb-datepicker [startDate]="{year: 2018, month: 1}"
                            [minDate]="{year: 2017, month: 1, day: 1}"
                            [maxDate]="{year: 2019, month: 12, day: 31}"
                            [showWeekNumbers]="true"
                            [displayMonths]="2"
            ></ngb-datepicker>`,
					providers: [{ provide: NgbDatepickerI18n, useClass: CustomI18n }],
				},
			});

			fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();
		});

		it('should allow overriding month labels', () => {
			const monthNameElements = fixture.nativeElement.querySelectorAll('.ngb-dp-month-name');
			const monthNames = Array.from(monthNameElements).map((o: HTMLElement) => o.innerText.trim());
			expect(monthNames).toEqual(['1-2018', '2-2018']);
		});
	});
});

@Component({
	selector: 'test-cmp',
	imports: [NgbDatepickerModule],
	template: '',
})
class TestComponent {}