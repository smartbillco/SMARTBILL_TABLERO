import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';

interface MenuOption {
  icon: string;
  label: string;
  route?: string; // Opcional, si se quiere navegar
  action?: () => void; // Acción opcional para ejecutar
  submenu?: MenuOption[]; // Submenú opcional
}

@Component({
  selector: 'app-boton-menu',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './boton-menu.component.html',
  styleUrls: ['./boton-menu.component.css']
})
export class BotonMenuComponent {
  
  @Input() icon: string = 'menu'; // Icono para el botón principal
  @Input() menuOptions: MenuOption[] = []; // Opciones de menú que se recibirán
  
  @Output() optionSelected = new EventEmitter<string>(); // Emite la opción seleccionada

  constructor(private router: Router) {}

  // Navegación dinámica
  navigateToRoute(route: string) {
    if (route) {
      this.router.navigateByUrl(route); // Navega a la ruta especificada
    }
  }

  // Ejecutar la acción asociada a la opción del menú
  executeAction(action?: () => void) {
    if (action) {
      action(); // Ejecuta la acción
    }
  }
}