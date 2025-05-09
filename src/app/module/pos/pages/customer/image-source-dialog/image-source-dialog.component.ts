import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material/material.module';

@Component({
  selector: 'app-image-source-dialog',
  templateUrl: './image-source-dialog.component.html',
  standalone: true,
  imports: [CommonModule, MaterialModule,  ],

})
export class ImageSourceDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ImageSourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {}

  selectAction(action: 'camera' | 'upload') {
    this.dialogRef.close({ action });
  }
}