import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GenericService } from '../../../pages/service/generic.service';
import { environment } from '../../../../environments/environment';
import { Department } from '../model/department.model';
@Injectable({
  providedIn: 'root'
})
export class DepartmentService extends GenericService<Department> {

  private departmentChange: Subject<Department[]> = new Subject<Department[]>();
  private messageChange: Subject<string> = new Subject<string>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST_DATOS}/departments`);
  }

  listPageable(page: number, size: number) {
    return this.http.get<any>(`${this.url}/pageable?page=${page}&size=${size}`);
  }

  setDepartmentChange(data: Department[]) {
    this.departmentChange.next(data);
  }

  getDepartmentChange() {
    return this.departmentChange.asObservable();
  }

  setMessageChange(data: string) {
    this.messageChange.next(data);
  }

  getMessageChange() {
    return this.messageChange.asObservable();
  }

  getUserDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.url}/user`);
  }

  getDepartmentsByModule(moduleName: string): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.url}/module/${moduleName}`);
  }


  getByUserAndModule(userId: number, module: string): Observable<any> {
    return this.http.get<any>(`${this.url}/by-user-and-module`, {
      params: {
        userId: userId.toString(),
        module: module
      }
    });
  }
}
