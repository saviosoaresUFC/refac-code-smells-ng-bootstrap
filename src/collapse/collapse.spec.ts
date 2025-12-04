import { ComponentFixture } from '@angular/core/testing';
import { createGenericTestComponent } from '../test/common';
import { Component } from '@angular/core';
import { NgbCollapse } from './collapse';
import { By } from '@angular/platform-browser';

const createTestComponent = (html: string) =>
	createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

function getCollapsibleContent(element: HTMLElement): HTMLDivElement {
	return <HTMLDivElement>element.querySelector('.collapse');
}

describe('ngb-collapse', () => {
	it('should have content open', () => {
		const fixture = createTestComponent(`<div [ngbCollapse]="collapsed">Some content</div>`);
		const collapseEl = getCollapsibleContent(fixture.nativeElement);
		expect(collapseEl).toHaveCssClass('show');
	});

	it(`should set css classes for horizontal collapse`, () => {
		const fixture = createTestComponent(`<div [ngbCollapse]="collapsed">Some content</div>`);
		const element = fixture.debugElement.query(By.directive(NgbCollapse));
		const directive = element.injector.get(NgbCollapse);

		expect(element.nativeElement).toHaveCssClass('collapse');
		expect(element.nativeElement).not.toHaveCssClass('collapse-horizontal');

		directive.horizontal = true;
		fixture.detectChanges();

		expect(element.nativeElement).toHaveCssClass('collapse');
		expect(element.nativeElement).toHaveCssClass('collapse-horizontal');
	});

	it('should have content closed', () => {
		const fixture = createTestComponent(`<div [ngbCollapse]="collapsed">Some content</div>`);
		const tc = fixture.componentInstance;
		tc.collapsed = true;
		fixture.detectChanges();

		const collapseEl = getCollapsibleContent(fixture.nativeElement);
		expect(collapseEl).not.toHaveCssClass('show');
	});

	it('should toggle collapsed content based on bound model change', () => {
		const fixture = createTestComponent(`<div [ngbCollapse]="collapsed">Some content</div>`);
		fixture.detectChanges();

		const tc = fixture.componentInstance;
		const collapseEl = getCollapsibleContent(fixture.nativeElement);
		expect(collapseEl).toHaveCssClass('show');

		tc.collapsed = true;
		fixture.detectChanges();
		expect(collapseEl).not.toHaveCssClass('show');

		tc.collapsed = false;
		fixture.detectChanges();
		expect(collapseEl).toHaveCssClass('show');
	});

	it('should allow toggling collapse from outside', () => {
		const fixture = createTestComponent(`
      <button (click)="collapse.toggle()">Collapse</button>
      <div [ngbCollapse]="collapsed" #collapse="ngbCollapse"></div>`);

		const compiled = fixture.nativeElement;
		const collapseEl = getCollapsibleContent(compiled);
		const buttonEl = compiled.querySelector('button');

		buttonEl.click();
		fixture.detectChanges();
		expect(collapseEl).not.toHaveCssClass('show');

		buttonEl.click();
		fixture.detectChanges();
		expect(collapseEl).toHaveCssClass('show');
	});

	it('should work with no binding', () => {
		const fixture = createTestComponent(`
      <button (click)="collapse.toggle()">Collapse</button>
      <div ngbCollapse #collapse="ngbCollapse"></div>`);

		const compiled = fixture.nativeElement;
		const collapseEl = getCollapsibleContent(compiled);
		const buttonEl = compiled.querySelector('button');

		buttonEl.click();
		fixture.detectChanges();
		expect(collapseEl).not.toHaveCssClass('show');

		buttonEl.click();
		fixture.detectChanges();
		expect(collapseEl).toHaveCssClass('show');
	});
});

@Component({
	selector: 'test-cmp',
	imports: [NgbCollapse],
	template: '',
})
class TestComponent {
	collapsed = false;
}