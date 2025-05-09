import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedCorrespondenceComponent } from './received-correspondence.component';

describe('ReceivedCorrespondenceComponent', () => {
  let component: ReceivedCorrespondenceComponent;
  let fixture: ComponentFixture<ReceivedCorrespondenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedCorrespondenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedCorrespondenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
