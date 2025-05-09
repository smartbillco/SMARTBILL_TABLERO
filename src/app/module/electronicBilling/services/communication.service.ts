import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private clearCompanyListSubject = new Subject<void>();

  clearCompanyList$ = this.clearCompanyListSubject.asObservable();

  triggerClearCompanyList() {
    this.clearCompanyListSubject.next();
  }
}