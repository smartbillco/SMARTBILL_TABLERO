import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryPositioningComponent } from './country-positioning.component';

describe('CountryPositioningComponent', () => {
  let component: CountryPositioningComponent;
  let fixture: ComponentFixture<CountryPositioningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryPositioningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryPositioningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
