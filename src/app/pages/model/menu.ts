export class Menu {
    idMenu?: number;       // Opcional
    icon?: string;         // Opcional
    title: string;         // Obligatorio
    url: string;           // Obligatorio
    caret?: string;        // Opcional
    submenu?: Menu[];      // Opcional
  
    constructor(
      title: string,        // Obligatorio
      url: string,          // Obligatorio
      idMenu?: number,      // Opcional
      icon?: string,        // Opcional
      caret?: string,       // Opcional
      submenu?: Menu[]      // Opcional
    ) {
      this.idMenu  = idMenu;
      this.icon    = icon;
      this.title   = title;
      this.url     = url;
      this.caret   = caret;
      this.submenu = submenu;
    }
  }