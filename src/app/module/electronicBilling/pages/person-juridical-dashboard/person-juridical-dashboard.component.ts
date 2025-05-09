import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  selector: 'app-person-juridical-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, HighlightModule],  
  templateUrl: './person-juridical-dashboard.component.html',
  styleUrl: './person-juridical-dashboard.component.scss'
})
export class PersonJuridicalDashboardComponent {

}
