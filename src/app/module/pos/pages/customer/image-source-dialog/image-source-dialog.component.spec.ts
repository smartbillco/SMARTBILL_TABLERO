import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageSourceDialogComponent } from './image-source-dialog.component';

describe('ImageSourceDialogComponent', () => {
  let component: ImageSourceDialogComponent;
  let fixture: ComponentFixture<ImageSourceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageSourceDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageSourceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
