import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteMovComponent } from '../cliente-mov/cliente-mov.component';
import { Customer } from '../../../model/customer';
import { MaterialModule } from '../../../shared/material/material.module';

@Component({
  selector: 'app-cliente-det',
  standalone: true,
  imports: [CommonModule,MaterialModule,ClienteMovComponent],
  templateUrl: './cliente-det.component.html',
  styleUrls: ['./cliente-det.component.css']
})
export class ClienteDetComponent {
  @Input() element!: Customer;
}
