import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GenericService } from '../../../pages/service/generic.service';
import { DocType } from '../model/doctype';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocTypeService extends GenericService<DocType> {

  private DoctypeChange: Subject<DocType[]> = new Subject<DocType[]>;
  private messageChange: Subject<string> = new Subject<string>;

  constructor(protected override http: HttpClient) { 
    super(http, `${environment.HOST_DATOS}/doctypes`);
  }

  listPageable(p: number, s: number){
    return this.http.get<any>(`${this.url}/pageable?page=${p}&size=${s}`);
  }

  /////////////////////////
  setDoctypeChange(data: DocType[]){
    this.DoctypeChange.next(data);
  }

  getDoctypeChange(){
    return this.DoctypeChange.asObservable();
  }

  setMessageChange(data: string){
    this.messageChange.next(data);
  }

  getMessageChange(){
    return this.messageChange.asObservable();
  }

}

