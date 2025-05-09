import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentCorrespondenceComponent } from './sent-correspondence.component';

describe('SentCorrespondenceComponent', () => {
  let component: SentCorrespondenceComponent;
  let fixture: ComponentFixture<SentCorrespondenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentCorrespondenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SentCorrespondenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
