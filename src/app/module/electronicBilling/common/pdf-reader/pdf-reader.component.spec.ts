import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfReaderComponent } from './pdf-reader.component';

describe('PdfReaderComponent', () => {
  let component: PdfReaderComponent;
  let fixture: ComponentFixture<PdfReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfReaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
