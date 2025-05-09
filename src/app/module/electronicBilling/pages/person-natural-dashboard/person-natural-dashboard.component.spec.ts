import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonNaturalDashboardComponent } from './person-natural-dashboard.component';

describe('PersonNaturalDashboardComponent', () => {
  let component: PersonNaturalDashboardComponent;
  let fixture: ComponentFixture<PersonNaturalDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonNaturalDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonNaturalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
