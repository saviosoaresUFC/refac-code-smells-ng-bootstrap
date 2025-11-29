import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModalWindow } from './modal-window';
import { getModalWindowElements } from './modal-dom-helper.spec';

describe('ngb-modal-dialog', () => {
	let fixture: ComponentFixture<NgbModalWindow>;
	let component: NgbModalWindow;

	beforeEach(() => {
		fixture = TestBed.createComponent(NgbModalWindow);
		component = fixture.componentInstance;
	});

	const getElements = () => getModalWindowElements(fixture);

	describe('basic rendering functionality', () => {
		it('should render default modal window', () => {
			fixture.detectChanges();
			const { modalEl, dialogEl } = getElements();

			expect(modalEl).toHaveCssClass('modal');
			expect(dialogEl).toHaveCssClass('modal-dialog');
		});

		it('should render default modal window with a specified size', () => {
			component.size = 'sm';
			fixture.detectChanges();
			const { dialogEl } = getElements();

			expect(dialogEl).toHaveCssClass('modal-dialog');
			expect(dialogEl).toHaveCssClass('modal-sm');
		});

		it('should render default modal window with a specified fullscreen size', () => {
			fixture.detectChanges();
			let { dialogEl } = getElements();

			expect(dialogEl).not.toHaveCssClass('modal-fullscreen');

			component.fullscreen = true;
			fixture.detectChanges();
			({ dialogEl } = getElements());
			expect(dialogEl).toHaveCssClass('modal-fullscreen');

			component.fullscreen = 'sm';
			fixture.detectChanges();
			({ dialogEl } = getElements());
			expect(dialogEl).toHaveCssClass('modal-fullscreen-sm-down');

			component.fullscreen = 'custom';
			fixture.detectChanges();
			({ dialogEl } = getElements());
			expect(dialogEl).toHaveCssClass('modal-fullscreen-custom-down');
		});

		it('should render default modal window with a specified class', () => {
			component.windowClass = 'custom-class';
			fixture.detectChanges();
			const { modalEl } = getElements();

			expect(modalEl).toHaveCssClass('custom-class');
		});

		it('aria attributes', () => {
			fixture.detectChanges();
			const { modalEl, dialogEl } = getElements();

			expect(modalEl.getAttribute('role')).toBe('dialog');
			expect(dialogEl.getAttribute('role')).toBe('document');
		});

		it('should render default modal window with a specified role', () => {
			component.role = 'alertdialog';
			fixture.detectChanges();
			const { modalEl, dialogEl } = getElements();

			expect(modalEl.getAttribute('role')).toBe('alertdialog');
			expect(dialogEl.getAttribute('role')).toBe('document');
		});

		it('should render modal dialog with a specified class', () => {
			component.modalDialogClass = 'custom-dialog-class';
			fixture.detectChanges();
			const { dialogEl } = getElements();

			expect(dialogEl).toHaveCssClass('modal-dialog');
			expect(dialogEl).toHaveCssClass('custom-dialog-class');
		});
	});
});