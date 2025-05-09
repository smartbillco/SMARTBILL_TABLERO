import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";

@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptor implements HttpInterceptor {

  private requests: HttpRequest<any>[] = [];
  constructor(private spinner: NgxSpinnerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Añadir la solicitud actual al arreglo
    this.requests.push(req);
    this.spinner.show(); 

    return next.handle(req).pipe(
      finalize(() => {
        // Remover la solicitud actual del arreglo
        this.requests = this.requests.filter((request) => request !== req);
        
        // Si no hay solicitudes pendientes, ocultar el spinner
        if (this.requests.length === 0) {
          this.spinner.hide();
        }
      })
    );
  }
}