import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GenericService } from '../../../pages/service/generic.service';
import { Regime } from '../model/regime';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegimeService extends GenericService<Regime> {

  private regimeChange: Subject<Regime[]> = new Subject<Regime[]>;
  private messageChange: Subject<string> = new Subject<string>;

  constructor(protected override http: HttpClient) { 
    super(http, `${environment.HOST_DATOS}/regimes`);
    
  }

  listPageable(p: number, s: number){
    return this.http.get<any>(`${this.url}/pageable?page=${p}&size=${s}`);
  }

  /////////////////////////
  setRegimeChange(data: Regime[]){
    this.regimeChange.next(data);
  }

  getRegimeChange(){
    return this.regimeChange.asObservable();
  }

  setMessageChange(data: string){
    this.messageChange.next(data);
  }

  getMessageChange(){
    return this.messageChange.asObservable();
  }

}

