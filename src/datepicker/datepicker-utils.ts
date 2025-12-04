import { NgbDate } from './ngb-date';
import { DatepickerViewModel } from './datepicker-view-model';
import { NgbCalendar } from './ngb-calendar';

export function isChangedDate(prev?: NgbDate | null, next?: NgbDate | null): boolean {
	return !dateComparator(prev, next);
}

export function isChangedMonth(prev?: NgbDate | null, next?: NgbDate | null): boolean {
	return !prev && !next ? false : !prev || !next ? true : prev.year !== next.year || prev.month !== next.month;
}

export function dateComparator(prev?: NgbDate | null, next?: NgbDate | null): boolean {
	return (!prev && !next) || (!!prev && !!next && prev.equals(next));
}

export function checkMinBeforeMax(minDate?: NgbDate | null, maxDate?: NgbDate | null): void {
	if (maxDate && minDate && maxDate.before(minDate)) {
		throw new Error(`'maxDate' ${maxDate} should be greater than 'minDate' ${minDate}`);
	}
}

export function checkDateInRange(
	date?: NgbDate | null,
	minDate?: NgbDate | null,
	maxDate?: NgbDate | null,
): NgbDate | null {
	if (date && minDate && date.before(minDate)) {
		return minDate;
	}
	if (date && maxDate && date.after(maxDate)) {
		return maxDate;
	}

	return date || null;
}

export function isDateSelectable(date: NgbDate | null | undefined, state: DatepickerViewModel) {
	const { minDate, maxDate, disabled, markDisabled } = state;
	return !(
		date === null ||
		date === undefined ||
		disabled ||
		(markDisabled && markDisabled(date, { year: date.year, month: date.month })) ||
		(minDate && date.before(minDate)) ||
		(maxDate && date.after(maxDate))
	);
}

export function nextMonthDisabled(calendar: NgbCalendar, date: NgbDate, maxDate: NgbDate | null) {
	const nextDate = Object.assign(calendar.getNext(date, 'm'), { day: 1 });
	return maxDate != null && nextDate.after(maxDate);
}

export function prevMonthDisabled(calendar: NgbCalendar, date: NgbDate, minDate: NgbDate | null) {
	const prevDate = Object.assign(calendar.getPrev(date, 'm'), { day: 1 });
	return (
		minDate != null &&
		((prevDate.year === minDate.year && prevDate.month < minDate.month) ||
			(prevDate.year < minDate.year && minDate.month === 1))
	);
}