import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentsModalComponent } from './attachments-modal.component';

describe('AttachmentsModalComponent', () => {
  let component: AttachmentsModalComponent;
  let fixture: ComponentFixture<AttachmentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttachmentsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttachmentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
