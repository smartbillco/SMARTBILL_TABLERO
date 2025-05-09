import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { GenericService } from "../../../pages/service/generic.service";
import { Role } from "../model/role";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RoleService extends GenericService<Role> {
  private readonly AMOCK_DATA_URL = "assets/roleData.json";

  private roleChange: Subject<Role[]> = new Subject<Role[]>();
  private messageChange: Subject<string> = new Subject<string>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST_DATOS}/roles`);
  }

  // Método para consumir roles desde archivo JSON local
  listRolesMock(): Observable<Role[]> {
    return this.http.get<Role[]>(this.AMOCK_DATA_URL);
  }

  // Método para consumir roles desde API paginada
  listPageable(p: number, s: number): Observable<any> {
    return this.http.get<any>(`${this.url}/pageable?page=${p}&size=${s}`);
  }

  // Observable para emitir cambios de lista de roles
  setRoleChange(data: Role[]) {
    this.roleChange.next(data);
  }

  getRoleChange(): Observable<Role[]> {
    return this.roleChange.asObservable();
  }

  // Observable para emitir mensajes tipo snackbar
  setMessageChange(data: string) {
    this.messageChange.next(data);
  }

  getMessageChange(): Observable<string> {
    return this.messageChange.asObservable();
  }
}
