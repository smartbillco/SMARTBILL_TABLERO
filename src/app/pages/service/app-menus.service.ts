import { Injectable } from "@angular/core";
import { GenericService } from "./generic.service";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { Menu } from "../model/menu";
import { environment } from "../../../environments/environment";

export interface MenuResponse {
  success: boolean;
  message: string;
  data: Menu[]; // Aquí se espera un arreglo de menús
}

@Injectable({
  providedIn: "root",
})
export class AppMenuService extends GenericService<Menu> {
  private menuChange = new Subject<Menu[]>();

  constructor(http: HttpClient) {
    super(http, `${environment.HOST_SEGURITY}/menus`);
  }

  getMenusByUser(username: string) {
    return this.http.post<Menu[]>(`${this.url}/user`, username);
  }

  getMenuChange() {
    return this.menuChange.asObservable();
  }

  setMenuChange(menus: Menu[]) {
    this.menuChange.next(menus);
  }

  getAppMenus2(username: string) {
    return this.http.post<Menu[]>(`${this.url}/user`, username);
  }

  filterMenus(response: any): any[] {
    let menus = Array.isArray(response.data) ? response.data : [];

    if (!Array.isArray(menus)) {
      console.error("La variable menus no es un arreglo:", menus);
      return [];
    }

    // Ordenar los menús por 'codigo' o 'idMenu'
    menus = menus.sort(
      (a, b) => (a.codigo || a.idMenu) - (b.codigo || b.idMenu)
    );

    const submenuIds = new Set(
      menus.flatMap((menu) =>
        menu.submenu ? menu.submenu.map((submenu) => submenu.idMenu) : []
      )
    );

    return menus
      .filter((menu) => !submenuIds.has(menu.idMenu))
      .map((menu) => {
        const filteredMenu: any = { ...menu };

        // Convertir 'caret' a null si no es 'true'
        filteredMenu.caret = filteredMenu.caret === "true" ? "true" : null;

        // Eliminar 'idMenu'
        delete filteredMenu.idMenu;

        // Eliminar 'icon' si es null
        if (filteredMenu.icon === null) {
          delete filteredMenu.icon;
        }

        // Filtrar submenús recursivamente
        if (filteredMenu.submenu && Array.isArray(filteredMenu.submenu)) {
          filteredMenu.submenu = this.filterMenus({
            data: filteredMenu.submenu,
          });

          // Eliminar 'submenu' si está vacío
          if (filteredMenu.submenu.length === 0) {
            delete filteredMenu.submenu;
          }
        }

        return filteredMenu;
      });
  }

  /*
  getAppMenus(username: string): Observable<MenuResponse> {
    return this.http.post<MenuResponse>(`${this.url}/user`, username);
  }*/

  // Alternativa: Menú predeterminado en caso de que el servicio falle

  getAppMenus() {
    return [
      {
        "icon": "fa fa-home",
        "title": "Bienvenidos",
        "url": "/module/necessary/welcome",
        "caret": "true"
      },
      {
        "icon": "fa fa-credit-card",
        "title": "Fact. Electronica",
        "url": "",
        "caret": "true",
        "submenu": [
          {
            "title": "Persona Natural",
            "url": "/module/electronicBilling/person-natural",
            "caret": null
          },
          {
            "title": "Persona Juridica",
            "url": "/module/electronicBilling/person-legal",
            "caret": null
          }
        ]
      },
      {
        "icon": "fa fa-store",
        "title": "Pos",
        "url": "",
        "caret": "true",
        "submenu": [
          {
            "icon": "fa fa-user",
            "title": "Cliente",
            "url": "/module/pos/customer",
            "caret": null
          },
          {
            "icon": "fa fa-building",
            "title": "Proveedor",
            "url": "/module/pos/supplier",
            "caret": null
          },
          {
            "icon": "fa fa-list",
            "title": "Categoria",
            "url": "/module/pos/category",
            "caret": null
          },
          {
            "icon": "fa fa-box",
            "title": "Producto",
            "url": "/module/pos/product",
            "caret": null
          },
          {
            "icon": "fa fa-shopping-cart",
            "title": "Ventas",
            "url": "/module/pos/sales",
            "caret": null
          },
          {
            "icon": "fa fa-chart-pie",
            "title": "Reporte",
            "url": "/module/pos/report",
            "caret": null
          }
        ]
      }
    ]

  }
}
