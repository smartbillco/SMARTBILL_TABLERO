import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatAccordion } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material/material.module';

@Component({
  selector: 'app-cliente-mov',
  standalone: true,
  imports: [CommonModule, MaterialModule], 
  templateUrl: './cliente-mov.component.html',
  styleUrls: ['./cliente-mov.component.css'],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteMovComponent {
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  openAll(): void {
    this.accordion.openAll();
  }

  closeAll(): void {
    this.accordion.closeAll();
  }
}