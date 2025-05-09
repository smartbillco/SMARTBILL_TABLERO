import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

declare var bootstrap: any;

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private selectedFileSource = new BehaviorSubject<any>(null);
  selectedFile$ = this.selectedFileSource.asObservable();

  private selectedInvoiceSource = new BehaviorSubject<any>(null);
  selectedInvoice$ = this.selectedInvoiceSource.asObservable();

  constructor(private toastr: ToastrService) { }

  // Abre el modal de archivo
  openFileModal(company: any): void {
    this.selectedFileSource.next(company);
    const modal = new bootstrap.Modal(document.getElementById("fileModal"));
    modal.show();
  }

  // Abre el modal de detalles de factura
  openInvoiceDetailsModal(invoice: any): void {
    const subtotalPrecio = invoice.precioItemFormatted.reduce((total: number, precio: number) => total + precio, 0);
    const subtotalImpuesto = invoice.impuestoValorItemFormatted.reduce((total: number, impuesto: number) => total + impuesto, 0);
    const totalFactura = subtotalPrecio + subtotalImpuesto;

    console.log("subtotal: ", subtotalPrecio);
    console.log("subtotal impuesto: ", subtotalImpuesto);
    console.log("total factura: ", totalFactura);

    this.selectedInvoiceSource.next({ ...invoice, subtotalPrecio, subtotalImpuesto, totalFactura });
    const modal = new bootstrap.Modal(document.getElementById("invoiceDetailsModal"));
    modal.show();
  }

  // Muestra los detalles de la factura
  viewInvoiceDetails(invoice: any): void {
    this.selectedInvoiceSource.next(invoice);
  }

  // Maneja los errores y muestra un mensaje con Toastr
  handleError(error: any, message: string): void {
    console.error(message, error);
    this.toastr.error(message);
  }
}
