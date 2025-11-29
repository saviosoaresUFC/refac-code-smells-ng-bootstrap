import { ComponentFixture } from '@angular/core/testing';
import { NgbModalWindow } from './modal-window';

export function getModalWindowElements(fixture: ComponentFixture<NgbModalWindow>): { modalEl: Element, dialogEl: Element } {
    const modalEl: Element = fixture.nativeElement;
    const dialogEl: Element = modalEl.querySelector('.modal-dialog')!; 
    return { modalEl, dialogEl };
}