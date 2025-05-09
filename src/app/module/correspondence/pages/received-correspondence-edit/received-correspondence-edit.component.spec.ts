import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedCorrespondenceEditComponent } from './received-correspondence-edit.component';

describe('ReceivedCorrespondenceEditComponent', () => {
  let component: ReceivedCorrespondenceEditComponent;
  let fixture: ComponentFixture<ReceivedCorrespondenceEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedCorrespondenceEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedCorrespondenceEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
