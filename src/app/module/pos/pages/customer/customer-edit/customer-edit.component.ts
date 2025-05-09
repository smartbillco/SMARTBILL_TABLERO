import { Component, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ImageSourceDialogComponent } from '../image-source-dialog/image-source-dialog.component';
import { CustomerService } from '../../../services/customer.service';
import { ConsultService } from '../../../services/consult.service';
import { NotificationTwilioService } from '../../../../../module/electronicBilling/services/twilio_front/notification-service-twilio.service';
import { Customer } from '../../../model/customer';
import { MaterialModule } from '../../../shared/material/material.module';
import { CameraDialogComponent } from '../../../shared/camera-dialog/camera-dialog.component';
import { ImageUploadDialogComponent } from '../../../shared/image-upload-dialog/image-upload-dialog.component';
import { Regime } from '../../../../user-management/model/regime';
import { DocType } from '../../../../user-management/model/doctype';
import { RegimeService } from '../../../../user-management/service/regime.service';
import { DocTypeService } from '../../../../user-management/service/doctype.service';
import { NotificationService } from '../../../../../pages/service/notification.service';

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, RouterLink,  CommonModule, FormsModule, ],

  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.css']
})
export class CustomerEditComponent implements OnInit {
  // Properties
  id: number;
  form: FormGroup;
  isEdit: boolean;
  title: string;
  photo_url: string = '';
  regimes: Regime[]; 
  doctypes: DocType[]; 
  selectedFiles: FileList;
  imageData: SafeResourceUrl;
  imageSignal = signal(null);
  isSubmitting: boolean = false;

  @ViewChild('pdfModal') pdfModal: TemplateRef<any>;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private dialog: MatDialog,
    private regimeService: RegimeService,
    private doctypeService: DocTypeService,
    
    private consultService: ConsultService,
    public sanitizer: DomSanitizer,

    private notificationtwilioService: NotificationTwilioService,
    private notificationService: NotificationService,

  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.isEdit = this.id != null;
      this.title = this.isEdit ? 'EDITANDO CLIENTE' : 'NUEVO CLIENTE';
      this.isEdit ? this.loadCustomerData() : this.loadSelect();
    });

    this.loadSelect(); 
  }

  // Form Initialization
  initForm() {
    this.form = new FormGroup({
      idCustomer: new FormControl(0),
      idDoctype: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
      idRegime: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      firstName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(70), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(70), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]),
      documentNumber: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[0-9]+$/)]),
      phoneNumber: new FormControl('', [Validators.required, Validators.minLength(7), Validators.maxLength(15), Validators.pattern(/^\+?[0-9]{1,3}?[0-9]{7,15}$/)]),
      address: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]),
      email: new FormControl('', [Validators.required,Validators.minLength(5),Validators.email,Validators.pattern('[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{1,5}')]),                                                              // Expresión regular para validar correo
      dateOfBirth: new FormControl(''), // Valor predeterminado
      photo_url:new FormControl(''),
    });
  }

  formatDate(event: any) {
    const input = event.target.value;
    // Eliminar todas las barras y caracteres que no sean dígitos
    const digits = input.replace(/\D/g, '');
  
    // Formatear la fecha como DD/MM/YYYY
    let formattedDate = '';
    if (digits.length > 0) {
      formattedDate += digits.substring(0, 2); // DD
    }
    if (digits.length >= 2) {
      formattedDate += '/' + digits.substring(2, 4); // MM
    }
    if (digits.length >= 4) {
      formattedDate += '/' + digits.substring(4, 8); // YYYY
    }
  
    // Asignar el valor formateado de nuevo al input
    event.target.value = formattedDate;
  }

  // Data Loading
  loadCustomerData() {
    forkJoin({
      customer: this.customerService.findById(this.id),
    }).subscribe({
      next: ({ customer }) => {
        this.form.patchValue({
          idCustomer: customer.idCustomer,
          idRegime: customer.idRegime,
          idDoctype: customer.idDoctype,
          firstName: customer.firstName,
          lastName: customer.lastName,
          documentNumber: customer.documentNumber,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          email: customer.email,
          dateOfBirth: format(customer.dateOfBirth, "yyyy-MM-dd'T'HH:mm:ss"),
          photo_url:customer.photo_url
        });
        this.applySanitizer(this.form.value.photo_url);
      },
    });
  }

  loadSelect() {
    this.regimeService.findAll().subscribe(data => { this.regimes = data });
    this.doctypeService.findAll().subscribe(data => { this.doctypes = data });
  }

  operate() {
    const customer: Customer = this.form.value;
    customer.photo_url = this.photo_url;

      // Deshabilitar el botón para evitar múltiples clics
  this.isSubmitting = true;

    if (this.isEdit) {
      this.updateCustomer(customer);
    } else {
      this.createCustomer(customer);
    }
  }

  updateCustomer(customer: Customer) {
    this.customerService.update(this.id, customer)
      .pipe(switchMap(() => this.customerService.findAll()))
      .subscribe({
        next: (data) => {
          this.customerService.setCustomerChange(data);
          this.customerService.setMessageChange('UPDATED!');
          this.notificationService.showSuccess('El cliente ha sido actualizado.', 'Actualizado');
          this.router.navigate(['/pages/customer']);
        },
        error: (err) => {
          this.notificationService.showError('Hubo un error al actualizar el cliente.', 'Error');
        }
      });
  }

  createCustomer(customer: Customer) {
    this.customerService.save(customer)
      .pipe(switchMap(() => this.customerService.findAll()))
      .subscribe({
        next: (data) => {
          this.customerService.setCustomerChange(data);
          this.customerService.setMessageChange('CREATED!');
  
          // Enviar notificación SMS y WhatsApp
          const phoneNumber = '+57' + customer.phoneNumber;
          const smsMessage = `Estimado ${customer.firstName}, *SmartBill* le informa que ha sido *creado* correctamente como cliente en el aplicativo. Agradecemos su preferencia.`;
          const whatsappMessage = `Estimado ${customer.firstName}, *SmartBill* le informa que ha sido *creado* correctamente como cliente en el aplicativo. Agradecemos su preferencia.`;
  
          // Llamar al servicio de notificación
          this.notificationtwilioService.sendNotifications(phoneNumber, smsMessage, whatsappMessage);
  
          this.notificationService.showSuccess('El cliente ha sido registrado.', 'Creado');
          this.router.navigate(['/pages/customer']);
        },
        error: (err) => {
          this.notificationService.showError('Hubo un error al registrar el cliente.', 'Error');
        }
      });
  }
  
  get f() {
    return this.form.controls;
  }

  takePictureDialog() {
    const dialogRef = this.dialog.open(CameraDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.photo_url = result; 
      }
    });
  }

  openImageUploadDialog() {
    const dialogRef = this.dialog.open(ImageUploadDialogComponent);
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.base64) {
        this.photo_url = result.base64; 
      }
    });
  }
  
  selectImageSource() {
    const dialogRef = this.dialog.open(ImageSourceDialogComponent, {
      width: '300px',
      data: { title: 'Selecciona una opción' }
    });
  
    dialogRef.afterClosed().subscribe((result: { action: 'camera' | 'upload' }) => {
      if (result) {
        if (result.action === 'camera') {
          this.takePictureDialog();
        } else if (result.action === 'upload') {
          this.openImageUploadDialog();
        }
      }
    });
  }



  pastDateValidator(control: FormControl) {
    const date = new Date(control.value);
    const today = new Date();
    return date >= today ? { past: true } : null; 
  }

  viewImage() {
    this.consultService.readFile(2).subscribe(data => {
      this.convertToBase64(data);
    });
  }

  convertToBase64(data: any) {
    const reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onloadend = () => {
      const base64 = reader.result;
      this.applySanitizer(base64);
    };
  }

  applySanitizer(base64: any) {
    this.imageData = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
    //this.imageSignal.set(this.imageData);
    this.photo_url = base64; 
  }



  uploadedFile: File | null = null;
  uploadDocument() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';  // Solo acepta PDFs

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadedFile = file;  
        // Aquí podrías agregar lógica para procesar el archivo
      }
    };

    fileInput.click();  
  }

  removeDocument() {
    this.uploadedFile = null; 
  }


openPdfPreview() {
 
}

}

