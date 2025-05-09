import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';
import { Customer } from '../model/customer';
import { Observable, Subject } from 'rxjs';
import { GenericService } from '../../../pages/service/generic.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends GenericService<Customer> {
  
  private customerChange: Subject<Customer[]> = new Subject<Customer[]>();
  private messageChange: Subject<string> = new Subject<string>();

  constructor(protected override http: HttpClient) { 
    super(http, `${environment.HOST_DATOS}/customers`);
  }

  setCustomerChange(data: Customer[]) {
    this.customerChange.next(data);
  }

  getCustomerChange() {
    return this.customerChange.asObservable();
  }

  setMessageChange(data: string) {
    this.messageChange.next(data);
  }

  getMessageChange() {
    return this.messageChange.asObservable();
  }

   /*updatePhoto(customerId: number, photoFile: File): Observable<void> {
    const formData: FormData = new FormData();
    formData.append('photoFile', photoFile); 

    return this.http.post<void>(`/api/updateCustomerPhoto/${customerId}`, formData);
  }*/
}
