import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartPatternedComponent } from './chart-patterned.component';

describe('ChartPatternedComponent', () => {
  let component: ChartPatternedComponent;
  let fixture: ComponentFixture<ChartPatternedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartPatternedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartPatternedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
