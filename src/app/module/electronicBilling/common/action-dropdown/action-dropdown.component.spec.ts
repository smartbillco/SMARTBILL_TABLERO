import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionDropdownComponent } from './action-dropdown.component';

describe('ActionDropdownComponent', () => {
  let component: ActionDropdownComponent;
  let fixture: ComponentFixture<ActionDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
