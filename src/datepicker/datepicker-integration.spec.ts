import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Injectable, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NgbDatepickerModule } from './datepicker.module';
import { NgbCalendar, NgbCalendarGregorian } from './ngb-calendar';
import { NgbDate } from './ngb-date';
import { getMonthSelect, getYearSelect } from '../test/datepicker/common';
import { NgbDatepicker, NgbDatepickerMonth } from './datepicker';
import { NgbDatepickerKeyboardService } from './datepicker-keyboard-service';

describe('ngb-datepicker integration', () => {
	it('should allow overriding datepicker calendar', () => {
		@Injectable()
		class FixedTodayCalendar extends NgbCalendarGregorian {
			getToday() {
				return new NgbDate(2000, 7, 1);
			}
		}

		TestBed.overrideComponent(TestComponent, {
			set: {
				template: `<ngb-datepicker></ngb-datepicker>`,
				providers: [{ provide: NgbCalendar, useClass: FixedTodayCalendar }],
			},
		});
		const fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();

		expect(getMonthSelect(fixture.nativeElement).value).toBe('7');
		expect(getYearSelect(fixture.nativeElement).value).toBe('2000');
	});

	describe('keyboard service', () => {
		@Injectable()
		class CustomKeyboardService extends NgbDatepickerKeyboardService {
			processKey(event: KeyboardEvent, service: NgbDatepicker) {
				const state = service.state;
				switch (event.key) {
					case 'PageUp':
						service.focusDate(service.calendar.getPrev(state.focusedDate, event.altKey ? 'y' : 'm', 1));
						break;
					case 'PageDown':
						service.focusDate(service.calendar.getNext(state.focusedDate, event.altKey ? 'y' : 'm', 1));
						break;
					default:
						super.processKey(event, service);
						return;
				}
				event.preventDefault();
				event.stopPropagation();
			}
		}

		let fixture: ComponentFixture<TestComponent>;
		let calendar: NgbCalendar;
		let mv: NgbDatepickerMonth;
		let startDate: NgbDate = new NgbDate(2018, 1, 1);

		beforeEach(() => {
			TestBed.overrideComponent(TestComponent, {
				set: {
					template: `
            <ngb-datepicker [startDate]="{year: 2018, month: 1}" [displayMonths]="1"></ngb-datepicker>`,
					providers: [{ provide: NgbDatepickerKeyboardService, useClass: CustomKeyboardService }],
				},
			});

			fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();
			calendar = fixture.debugElement.query(By.css('ngb-datepicker')).injector.get(NgbDatepicker).calendar;
			mv = fixture.debugElement.query(By.css('ngb-datepicker-month')).injector.get(NgbDatepickerMonth);

			spyOn(calendar, 'getPrev');
		});

		it('should allow customize keyboard navigation', () => {
			mv.onKeyDown(<any>{ key: 'PageUp', altKey: true, preventDefault: () => {}, stopPropagation: () => {} });
			expect(calendar.getPrev).toHaveBeenCalledWith(startDate, 'y', 1);
			mv.onKeyDown(<any>{ key: 'PageUp', shiftKey: true, preventDefault: () => {}, stopPropagation: () => {} });
			expect(calendar.getPrev).toHaveBeenCalledWith(startDate, 'm', 1);
		});

		it('should allow access to default keyboard navigation', () => {
			mv.onKeyDown(<any>{ key: 'ArrowUp', altKey: true, preventDefault: () => {}, stopPropagation: () => {} });
			expect(calendar.getPrev).toHaveBeenCalledWith(startDate, 'd', 7);
		});
	});

	describe('ngb-datepicker-month', () => {
		let fixture: ComponentFixture<TestComponent>;
		let mv: NgbDatepickerMonth;
		let startDate: NgbDate = new NgbDate(2018, 1, 1);
		let ngbCalendar: NgbCalendar;

		beforeEach(() => {
			TestBed.overrideComponent(TestComponent, {
				set: {
					template: `
            <ngb-datepicker [startDate]="{year: 2018, month: 1}" [displayMonths]="1">
              <ng-template ngbDatepickerContent>
                <ngb-datepicker-month [month]="{year: 2018, month: 1}"></ngb-datepicker-month>
              </ng-template>
            </ngb-datepicker>`,
				},
			});

			fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();
			mv = fixture.debugElement.query(By.css('ngb-datepicker-month')).injector.get(NgbDatepickerMonth);
			ngbCalendar = fixture.debugElement.query(By.css('ngb-datepicker')).injector.get(NgbCalendar as Type<NgbCalendar>);

			spyOn(ngbCalendar, 'getPrev');
		});

		it('should preserve the functionality of keyboard service', () => {
			mv.onKeyDown(<any>{ key: 'ArrowUp', altKey: true, preventDefault: () => {}, stopPropagation: () => {} });
			expect(ngbCalendar.getPrev).toHaveBeenCalledWith(startDate, 'd', 7);
		});
	});
});

@Component({
	selector: 'test-cmp',
	imports: [NgbDatepickerModule],
	template: '',
})
class TestComponent {}