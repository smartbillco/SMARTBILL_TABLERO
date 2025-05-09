import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-action-dropdown',
  templateUrl: './action-dropdown.component.html',
  styleUrls: ['./action-dropdown.component.css'],
    standalone: true,
    imports: [
      FormsModule,
      CommonModule]
})
export class ActionDropdownComponent {
  // Acción seleccionada
  selectedAction: string = 'compra';

  // Evento para emitir la acción seleccionada
  @Output() actionSelected = new EventEmitter<string>();

  // Función para cambiar la acción y emitir el evento
  setAction(action: string) {
    this.selectedAction = action;
    this.actionSelected.emit(action);
  }

  // Devuelve la clase del icono según la acción
  getActionIcon() {
    return this.selectedAction === 'compra' ? 'fas fa-shopping-cart' : 'fas fa-tag';
  }

  // Devuelve la etiqueta de la acción
  getActionLabel() {
    return this.selectedAction === 'compra' ? 'Compra' : 'Venta';
  }
}
