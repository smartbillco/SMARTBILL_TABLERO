import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyCountryComponent } from './company-country.component';

describe('CompanyCountryComponent', () => {
  let component: CompanyCountryComponent;
  let fixture: ComponentFixture<CompanyCountryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyCountryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
