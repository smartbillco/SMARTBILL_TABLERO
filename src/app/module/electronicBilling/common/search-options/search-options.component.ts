import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-options',
  templateUrl: './search-options.component.html',
  styleUrls: ['./search-options.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SearchOptionsComponent {
  @Output() optionsChanged = new EventEmitter<string[]>();
  
  showOptions = false;
  searchOptions = [
    { 
      id: 'data', 
      label: 'Buscar en Data', 
      checked: true,
      icon: 'fa-database' 
    },
    { 
      id: 'email', 
      label: 'Buscar en Correos', 
      checked: false,
      icon: 'fa-envelope' 
    },
    { 
      id: 'onedrive', 
      label: 'Buscar en OneDrive', 
      checked: false,
      icon: 'fa-cloud' 
    },
    { 
      id: 'sharepoint', 
      label: 'Buscar en SharePoint', 
      checked: false,
      icon: 'fa-share-alt' 
    }
  ];
  
  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  toggleOption(optionId: string) {
    const option = this.searchOptions.find(opt => opt.id === optionId);
    if (option) {
      option.checked = !option.checked;
      this.emitSelectedOptions();
    }
  }

  private emitSelectedOptions() {
    const selectedOptions = this.searchOptions
      .filter(opt => opt.checked)
      .map(opt => opt.id);
    this.optionsChanged.emit(selectedOptions);
  }
}