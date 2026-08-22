import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Modal, ModalFooter } from './modal';

@Component({
  imports: [Modal, ModalFooter],
  template: `
    <app-modal [isOpen]="true" title="With footer">
      <p>body</p>
      <button modalFooter>Confirm</button>
    </app-modal>
  `,
})
class WithFooterHost {}

@Component({
  imports: [Modal],
  template: `<app-modal [isOpen]="true" title="No footer"><p>body</p></app-modal>`,
})
class WithoutFooterHost {}

describe('Modal', () => {
  it('renders the footer bar when footer content is projected', () => {
    const fixture = TestBed.createComponent(WithFooterHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.border-t')).toBeTruthy();
    expect(element.querySelector('.border-t')?.textContent).toContain('Confirm');
  });

  it('omits the footer bar when no footer content is projected', () => {
    const fixture = TestBed.createComponent(WithoutFooterHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('body');
    expect(element.querySelector('.border-t')).toBeNull();
  });
});
