import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonJuridicalDashboardComponent } from './person-juridical-dashboard.component';

describe('PersonJuridicalDashboardComponent', () => {
  let component: PersonJuridicalDashboardComponent;
  let fixture: ComponentFixture<PersonJuridicalDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonJuridicalDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonJuridicalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
