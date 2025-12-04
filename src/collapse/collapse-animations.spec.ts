import { TestBed } from '@angular/core/testing';
import { isBrowserVisible } from '../test/common';
import { Component, provideZoneChangeDetection } from '@angular/core';
import { NgbCollapse } from './collapse';
import { NgbConfig } from '@ng-bootstrap/ng-bootstrap/config';
import { NgbConfigAnimation } from '../test/ngb-config-animation';

function getCollapsibleContent(element: HTMLElement): HTMLDivElement {
	return <HTMLDivElement>element.querySelector('.collapse');
}

if (isBrowserVisible('ngb-collapse animations')) {
	describe('ngb-collapse animations', () => {
		@Component({
			imports: [NgbCollapse],
			template: `
				<button (click)="c.toggle()">Collapse!</button>
				<div
					[(ngbCollapse)]="collapsed"
					#c="ngbCollapse"
					(ngbCollapseChange)="onCollapse()"
					(shown)="onShown()"
					(hidden)="onHidden()"
				></div>
			`,
			host: { '[class.ngb-reduce-motion]': 'reduceMotion' },
		})
		class TestAnimationComponent {
			collapsed = false;
			reduceMotion = true;
			onCollapse = () => {};
			onShown = () => {};
			onHidden = () => {};
		}

		beforeEach(() => {
			TestBed.configureTestingModule({
				providers: [{ provide: NgbConfig, useClass: NgbConfigAnimation }, provideZoneChangeDetection()],
			});
		});

		it(`should run collapsing transition (force-reduced-motion = false)`, (done) => {
			const fixture = TestBed.createComponent(TestAnimationComponent);
			fixture.componentInstance.reduceMotion = false;
			fixture.detectChanges();

			const buttonEl = fixture.nativeElement.querySelector('button');
			const content = getCollapsibleContent(fixture.nativeElement);

			const onCollapseSpy = spyOn(fixture.componentInstance, 'onCollapse');
			const onShownSpy = spyOn(fixture.componentInstance, 'onShown');
			const onHiddenSpy = spyOn(fixture.componentInstance, 'onHidden');

			// First we're going to collapse, then expand
			onHiddenSpy.and.callFake(() => {
				expect(content).toHaveClass('collapse');
				expect(content).not.toHaveClass('show');
				expect(content).not.toHaveClass('collapsing');

				// Expanding
				buttonEl.click();
				fixture.detectChanges();
				expect(onShownSpy).not.toHaveBeenCalled();
				expect(content).not.toHaveClass('collapse');
				expect(content).not.toHaveClass('show');
				expect(content).toHaveClass('collapsing');
			});

			onShownSpy.and.callFake(() => {
				expect(onCollapseSpy).toHaveBeenCalledTimes(2);
				expect(content).toHaveClass('collapse');
				expect(content).toHaveClass('show');
				expect(content).not.toHaveClass('collapsing');

				done();
			});

			expect(content).toHaveClass('collapse');
			expect(content).toHaveClass('show');
			expect(content).not.toHaveClass('collapsing');
			expect(fixture.componentInstance.collapsed).toBe(false);

			// Collapsing
			buttonEl.click();
			fixture.detectChanges();
			expect(onHiddenSpy).not.toHaveBeenCalled();
			expect(onCollapseSpy).toHaveBeenCalledTimes(1);
			expect(content).not.toHaveClass('collapse');
			expect(content).not.toHaveClass('show');
			expect(content).toHaveClass('collapsing');
		});

		it(`should run collapsing transition (force-reduced-motion = true)`, () => {
			const fixture = TestBed.createComponent(TestAnimationComponent);
			fixture.componentInstance.reduceMotion = true;
			fixture.detectChanges();

			const buttonEl = fixture.nativeElement.querySelector('button');
			const content = getCollapsibleContent(fixture.nativeElement);

			const onCollapseSpy = spyOn(fixture.componentInstance, 'onCollapse');
			const onShownSpy = spyOn(fixture.componentInstance, 'onShown');
			const onHiddenSpy = spyOn(fixture.componentInstance, 'onHidden');

			expect(content).toHaveClass('collapse');
			expect(content).toHaveClass('show');
			expect(content).not.toHaveClass('collapsing');
			expect(fixture.componentInstance.collapsed).toBe(false);

			// Collapsing
			buttonEl.click();
			fixture.detectChanges();
			expect(onHiddenSpy).toHaveBeenCalled();
			expect(onCollapseSpy).toHaveBeenCalledTimes(1);
			expect(content).toHaveClass('collapse');
			expect(content).not.toHaveClass('show');
			expect(content).not.toHaveClass('collapsing');

			// Expanding
			buttonEl.click();
			fixture.detectChanges();
			expect(onShownSpy).toHaveBeenCalled();
			expect(onCollapseSpy).toHaveBeenCalledTimes(2);
			expect(content).toHaveClass('collapse');
			expect(content).toHaveClass('show');
			expect(content).not.toHaveClass('collapsing');
		});

		it(`should run revert collapsing transition (force-reduced-motion = false)`, (done) => {
			const fixture = TestBed.createComponent(TestAnimationComponent);
			fixture.componentInstance.reduceMotion = false;
			fixture.detectChanges();

			const buttonEl = fixture.nativeElement.querySelector('button');
			const content = getCollapsibleContent(fixture.nativeElement);

			const onCollapseSpy = spyOn(fixture.componentInstance, 'onCollapse');
			const onShownSpy = spyOn(fixture.componentInstance, 'onShown');
			const onHiddenSpy = spyOn(fixture.componentInstance, 'onHidden');

			onShownSpy.and.callFake(() => {
				expect(onHiddenSpy).not.toHaveBeenCalled();
				expect(fixture.componentInstance.collapsed).toBe(false);
				expect(content).toHaveClass('collapse');
				expect(content).toHaveClass('show');
				expect(content).not.toHaveClass('collapsing');
				done();
			});

			expect(content).toHaveClass('collapse');
			expect(content).toHaveClass('show');
			expect(content).not.toHaveClass('collapsing');
			expect(fixture.componentInstance.collapsed).toBe(false);

			// Collapsing
			buttonEl.click();
			fixture.detectChanges();
			expect(onCollapseSpy).toHaveBeenCalledTimes(1);
			expect(content).not.toHaveClass('collapse');
			expect(content).not.toHaveClass('show');
			expect(content).toHaveClass('collapsing');

			// Expanding before hidden
			buttonEl.click();
			fixture.detectChanges();
			expect(onCollapseSpy).toHaveBeenCalledTimes(2);
			expect(content).not.toHaveClass('collapse');
			expect(content).not.toHaveClass('show');
			expect(content).toHaveClass('collapsing');
		});
	});
}