import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, Subject } from 'rxjs';
import { GenericService } from '../../../pages/service/generic.service';
import { AppModule } from '../model/appmodule';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ModuleService extends GenericService<AppModule> {

  private moduleChange: Subject<AppModule[]> = new Subject<AppModule[]>();
  private messageChange: Subject<string> = new Subject<string>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST_DATOS}/modules`);
  }

  listPageable(p: number, s: number) {
    return this.http.get<any>(`${this.url}/pageable?page=${p}&size=${s}`);
  }

  setModuleChange(data: AppModule[]) {
    this.moduleChange.next(data);
  }

  getModuleChange() {
    return this.moduleChange.asObservable();
  }

  setMessageChange(data: string) {
    this.messageChange.next(data);
  }

  getMessageChange() {
    return this.messageChange.asObservable();
  }


  getAllModules(): Observable<AppModule[]> {
    return this.http.get<AppModule[]>(this.url);  
  }
  

  getModulesByUserId(userId: number): Observable<AppModule[]> {
    console.log('Solicitando módulos para userId:', userId);
    
    return this.http.get<{success: boolean, message: string, data: AppModule[]}>(
      `${environment.HOST_DATOS}/users/${userId}/appmodules`
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data || []; 
      }),
      catchError(error => {
        console.error('Error al obtener módulos:', error);
        return of([]); 
      })
    );
  }
  
}
