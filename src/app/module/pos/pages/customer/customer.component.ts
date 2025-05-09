import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { switchMap } from 'rxjs/operators';
import { ClienteDetComponent } from './cliente-det/cliente-det.component';
import { Customer } from '../../model/customer';
import { CustomerService } from '../../services/customer.service';
import { MaterialModule } from '../../shared/material/material.module';
import { NotificationTwilioService } from '../../../../module/electronicBilling/services/twilio_front/notification-service-twilio.service';
import { LogoComponent } from '../../shared/logo/logo.component';
import { BotonMenuComponent } from '../../shared/boton-menu/boton-menu.component';
import { NotificationService } from '../../../../pages/service/notification.service';


@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [ClienteDetComponent,CommonModule, MaterialModule, RouterLink, RouterLinkActive, RouterOutlet, BotonMenuComponent,LogoComponent],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CustomerComponent implements OnInit {
  
  @ViewChild(MatSort) sort!: MatSort; // Asegúrate de inicializar con un operador de no nulo si usas Angular 9 o posterior

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<Customer>();
  columnsConfig = [
    { def: 'profileImage', label: 'Profile Image', hide: false },
    { def: 'idCustomer', label: 'ID Customer', hide: true },
    { def: 'firstName', label: 'First Name', hide: false },
    { def: 'lastName', label: 'Last Name', hide: true },
    { def: 'documentType', label: 'Document Type', hide: true },
    { def: 'documentNumber', label: 'Document Number', hide: true },
    { def: 'phoneNumber', label: 'Phone Number', hide: false },
    { def: 'address', label: 'Address', hide: true },
    { def: 'email', label: 'Email', hide: true },
    { def: 'dateOfBirth', label: 'Date of Birth', hide: true },
    { def: 'id_regime', label: 'Regime', hide: true },
    { def: 'actions', label: 'Actions', hide: false }
  ];
  columnsToDisplay = this.columnsConfig.filter(col => !col.hide).map(col => col.def);
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: Customer | null;



  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private notificationtwilioService: NotificationTwilioService,
    private notificationService: NotificationService,


  ) {}


  ngOnInit(): void {    
      this.customerService.findAll().subscribe(data => {
      //alert(JSON.stringify(data));
      this.createTable(data);     
    });

    this.customerService.getCustomerChange().subscribe(data => {
      //alert(JSON.stringify(data));
      this.createTable(data);
    });

  }

  getDisplayedColumns(): string[] {
    return this.columnsConfig.filter(cd => !cd.hide).map(cd => cd.def);
  }

  createTable(data: Customer[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  
  delete(idCustomer: number) {
    // Primero, obtenemos los datos del cliente para enviar la notificación
    this.customerService.findById(idCustomer).subscribe(customer => {
      const phoneNumber = '+57' + customer.phoneNumber;
      const smsMessage = `Estimado ${customer.firstName}, *SmartBill* le informa que está a punto de ser eliminado del sistema. Si no realizó esta acción, por favor contáctenos.`;
      const whatsappMessage = `Estimado ${customer.firstName}, *SmartBill* le informa que está a punto de ser eliminado del sistema. Si no realizó esta acción, por favor contáctenos.`;
  
      // Llamamos al método sendNotifications y nos suscribimos
      this.notificationtwilioService.sendNotifications(phoneNumber, smsMessage, whatsappMessage).subscribe({
        next: () => {
          // Mostrar un diálogo de confirmación usando NotificationService
          this.notificationService.showWarning(
            `Vas a eliminar el cliente con ID: ${idCustomer}. No podrás revertir esta acción.`,
            '¿Estás seguro?',
            10000 // Duración más larga para que el usuario tenga tiempo de leer
          );
  
          // Aquí podrías implementar un diálogo de confirmación personalizado si es necesario
          // Por ejemplo, usando un modal de Angular Material.
  
          // Simulamos la confirmación del usuario (esto debería ser reemplazado por un diálogo real)
          const userConfirmed = confirm('¿Estás seguro de que deseas eliminar este cliente?');
  
          if (userConfirmed) {
            // Procedemos con la eliminación
            this.customerService.delete(idCustomer)
              .pipe(switchMap(() => this.customerService.findAll()))
              .subscribe(data => {
                this.customerService.setCustomerChange(data);
                this.customerService.setMessageChange('¡Cliente eliminado con éxito!');
                this.notificationService.showSuccess('El cliente ha sido eliminado.', 'Eliminado');
              });
          }
        },
        error: () => {
          this.notificationService.showError('Hubo un problema al enviar las notificaciones', 'Error');
        }
      });
    });
  }  
  

  checkChildren() {
    return this.route.children.length > 0;
  }

 

  exportExcel = () => {
    //this.excelExportService.exportToExcel(this.dataSource.data, 'customers');
  }

  exportPdf = () => {
    //this.pdfExportService.exportToPdf(this.dataSource.data, 'customers');
  }

  uploadBatch = () => {
    console.log("Cargar archivo por lotes");
  }



  onOptionSelected(option: string) {
    console.log(`Opción seleccionada: ${option}`);
  }

  applyFilter(e: any) {
    this.dataSource.filter = e.target.value.trim().toLowerCase(); // Filtro sin distinción de mayúsculas
  }
  
}