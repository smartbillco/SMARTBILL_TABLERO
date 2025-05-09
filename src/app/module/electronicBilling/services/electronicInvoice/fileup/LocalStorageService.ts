import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Company } from "../../../model/company.model";

@Injectable({
    providedIn: 'root',
  })
  export class LocalStorageService {
    constructor(private toastr: ToastrService) {}
  
    loadStoredCompanies(): Company[] {
      const storedCompanies = localStorage.getItem('companiesData');
      return storedCompanies ? JSON.parse(storedCompanies) : [];
    }
  
    clearStoredCompanies(): void {
      localStorage.removeItem('companiesData');
      this.toastr.info('Datos eliminados correctamente');
    }
  
    updateLocalStorage(companies: Company[]): void {
      if (companies.length > 0) {
        localStorage.setItem('companiesData', JSON.stringify(companies));
      }
    }
    
  }