import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentCorrespondenceEditComponent } from './sent-correspondence-edit.component';

describe('SentCorrespondenceEditComponent', () => {
  let component: SentCorrespondenceEditComponent;
  let fixture: ComponentFixture<SentCorrespondenceEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentCorrespondenceEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SentCorrespondenceEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
