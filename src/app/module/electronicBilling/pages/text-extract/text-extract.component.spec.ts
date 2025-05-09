import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextExtractComponent } from './text-extract.component';

describe('TextExtractComponent', () => {
  let component: TextExtractComponent;
  let fixture: ComponentFixture<TextExtractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextExtractComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextExtractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
