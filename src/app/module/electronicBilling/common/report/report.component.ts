import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule,
  ],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent {
  @Input() title: string = 'Reporte';
  @Input() columns: string[] = [];
  @Input() data: any[] = [];
}
