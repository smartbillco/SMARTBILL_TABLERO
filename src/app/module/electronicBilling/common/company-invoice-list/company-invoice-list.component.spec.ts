import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInvoiceListComponent } from './company-invoice-list.component';

describe('CompanyInvoiceListComponent', () => {
  let component: CompanyInvoiceListComponent;
  let fixture: ComponentFixture<CompanyInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyInvoiceListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
