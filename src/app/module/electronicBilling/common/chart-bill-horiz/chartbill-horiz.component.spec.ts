import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartbillHorizComponent } from './chartbill-horiz.component';

describe('ChartbillHorizComponent', () => {
  let component: ChartbillHorizComponent;
  let fixture: ComponentFixture<ChartbillHorizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartbillHorizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartbillHorizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
