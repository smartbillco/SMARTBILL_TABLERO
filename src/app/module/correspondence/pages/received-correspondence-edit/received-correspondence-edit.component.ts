import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { firstValueFrom, forkJoin, Subject } from "rxjs";
import { CorrespondenceService } from "../../services/Correspondence.service";
import {
  CorrespondenceData,
  Sender,
  Attachment,
  CorrespondenceCategory,
  DocumentStatus,
  CorrespondenceType,
  Dependence,
} from "../../model/correspondence.model";
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common'; 
import { CorrespondenceMetadataService } from "../../services/CorrespondenceMetadataService";
import { NotificationService } from "../../../../pages/service/notification.service";

@Component({
  selector: "app-received-correspondence-edit",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./received-correspondence-edit.component.html",
  styleUrls: ["./received-correspondence-edit.component.scss"],
})
export class ReceivedCorrespondenceEditComponent implements OnInit, OnDestroy {
  @Output() submitCorrespondence = new EventEmitter<CorrespondenceData>();
  private destroy$ = new Subject<void>();

  correspondenceCategory: CorrespondenceCategory[] = [];
  dependences: Dependence[] = [];
  documentStatuses: DocumentStatus[] = [];
  correspondenceTypes: CorrespondenceType[] = [];
  senders: Sender[] = [];

  correspondenceForm: FormGroup;
  isEditMode = false;
  currentCorrespondenceId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private dataService: CorrespondenceMetadataService,
    private correspondenceService: CorrespondenceService,
    private notificationService: NotificationService,
    private location: Location 
  ) {
    this.correspondenceForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.currentCorrespondenceId = params['id'];
        this.loadCorrespondenceData(this.currentCorrespondenceId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      filingNumber: ["", Validators.required],
      filingDate: ["", Validators.required],
      documentDate: ["", Validators.required],
      externalFiling: [""],
      type: ["", Validators.required],
      subject: ["", [Validators.required, Validators.minLength(5)]],
      status: ["", Validators.required],
      subtype: [""],
      department: [""],
      text: ["", Validators.required],
      attachments: this.fb.array([]),
      sender: this.fb.group({
        idUser: ["", Validators.required],
        documentType: ["", Validators.required],
        documentNumber: ["", [Validators.required, Validators.pattern(/^\d+$/)]],
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        phoneNumber: ["", [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)]],
        address: ["", Validators.required],
      }),
    });
  }

  private async loadData(): Promise<void> {
    try {
      const {
        correspondenceTypes,
        documentStatuses,
        CorrespondenceCategory,
        dependences,
        senders,
      } = await firstValueFrom(
        forkJoin({
          correspondenceTypes: this.dataService.getCorrespondenceTypes(),
          documentStatuses: this.dataService.getDocumentStatuses(),
          CorrespondenceCategory: this.dataService.getCorrespondenceCategories(),
          dependences: this.dataService.getDependences(),
          senders: this.dataService.getSenders(),
        })
      );

      
    this.correspondenceTypes = correspondenceTypes.map((type: CorrespondenceType) => ({
      codCorrespondenceType: type.codCorrespondenceType,
      descripcion: type.descripcion
    }));

    this.documentStatuses = documentStatuses.map((status: DocumentStatus) => ({
      codDocumentStatus: status.codDocumentStatus,
      descripcion: status.descripcion
    }));

      this.correspondenceCategory = CorrespondenceCategory.map((categoria) => ({
        codCorrespondenceCategory: categoria.codCorrespondenceCategory,
        descripcion: categoria.descripcion,
        expiresInDays: categoria.expiresInDays,
      }));

      this.dependences = dependences.map((depen: Dependence) => ({
        codDependence: depen.codDependence,
        descripcion: depen.descripcion
      }));

      this.senders = senders;
    } catch (error) {
      console.error("Error al cargar datos", error);
      this.notificationService.showError(
        "Error al cargar datos iniciales",
        "Error"
      );
    }
  }

  async loadCorrespondenceData(id: string): Promise<void> {
    try {
      const data = await firstValueFrom(this.correspondenceService.getById(id));
      
      const formattedData = {
        ...data,
        filingDate: this.formatDateForInput(data.filingDate),
        documentDate: this.formatDateForInput(data.documentDate)
      };

      this.correspondenceForm.patchValue(formattedData);

      if (data.attachments && data.attachments.length > 0) {
        this.loadAttachments(data.attachments);
      }

    } catch (error) {
      console.error('Error al cargar correspondencia:', error);
      this.notificationService.showError('Error al cargar la correspondencia', 'Error');
    }
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  private loadAttachments(attachments: Attachment[]): void {
    while (this.attachments.length) {
      this.attachments.removeAt(0);
    }

    attachments.forEach(attachment => {
      this.attachments.push(this.fb.group({
        id: [attachment.id],
        name: [attachment.name, Validators.required],
        description: [attachment.description],
        fileUrl: [attachment.fileUrl]
      }));
    });
  }

  onSubmit(): void {
    if (this.correspondenceForm.valid) {
      const formData = this.correspondenceForm.value as CorrespondenceData;

      // Trimming strings
      formData.subject = formData.subject.trim();
      formData.senders.firstName = formData.senders.firstName.trim();
      formData.senders.lastName = formData.senders.lastName.trim();
      formData.senders.email = formData.senders.email.trim();
      formData.senders.phoneNumber = formData.senders.phoneNumber.trim();
      formData.senders.address = formData.senders.address.trim();

      if (this.isEditMode && this.currentCorrespondenceId) {
        this.updateCorrespondence(formData);
      } else {
        this.createCorrespondence(formData);
      }
    } else {
      this.notificationService.showWarning(
        "Formulario inválido. Verifica los campos requeridos.",
        "Advertencia"
      );
      console.warn("Formulario inválido. Verifica los campos requeridos.");
    }
  }

  private createCorrespondence(formData: CorrespondenceData): void {
    this.correspondenceService.createCorrespondence(formData).subscribe({
      next: (response) => {
        console.log("Correspondencia creada con éxito", response);
        this.notificationService.showSuccess(
          "Correspondencia creada con éxito",
          "Éxito"
        );
        this.correspondenceForm.reset();
        this.submitCorrespondence.emit(formData);
      },
      error: (error) => {
        this.notificationService.showError(
          "Error al crear la correspondencia",
          "Error"
        );
        console.error("Error al crear la correspondencia", error);
      },
    });
  }

  private updateCorrespondence(formData: CorrespondenceData): void {
    if (!this.currentCorrespondenceId) return;

    this.correspondenceService.updateCorrespondence(this.currentCorrespondenceId, formData).subscribe({
      next: (response) => {
        console.log("Correspondencia actualizada con éxito", response);
        this.notificationService.showSuccess(
          "Correspondencia actualizada con éxito",
          "Éxito"
        );
        this.submitCorrespondence.emit(formData);
      },
      error: (error) => {
        this.notificationService.showError(
          "Error al actualizar la correspondencia",
          "Error"
        );
        console.error("Error al actualizar la correspondencia", error);
      },
    });
  }

  onSenderSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const senderId = Number(selectElement.value);
    this.updateSenderForm(senderId);
  }

  onDocumentNumberInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | HTMLSelectElement;
    const documentNumber = inputElement.value.trim();
    const documentType = this.correspondenceForm.get("sender.documentType")?.value;

    const selectedSender = this.senders.find(
      (sender) =>
        sender.documentType === documentType &&
        sender.documentNumber === documentNumber
    );

    if (selectedSender) {
      this.updateSenderForm(selectedSender.idUser);
    } else {
      this.resetSenderForm();
    }
  }

  private updateSenderForm(senderId: number): void {
    const selectedSender = this.senders.find(
      (sender) => sender.idUser === senderId
    );
    if (selectedSender) {
      this.correspondenceForm.patchValue({
        sender: {
          idUser: selectedSender.idUser,
          firstName: selectedSender.firstName.trim(),
          lastName: selectedSender.lastName.trim(),
          email: selectedSender.email.trim(),
          phoneNumber: selectedSender.phoneNumber.trim(),
          address: selectedSender.address.trim(),
          documentType: selectedSender.documentType,
          documentNumber: selectedSender.documentNumber,
        },
      });
    }
  }

  private resetSenderForm(): void {
    this.correspondenceForm.get("sender")?.reset({
      documentType: "",
      documentNumber: "",
      idUser: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
    });
  }

  get attachments(): FormArray {
    return this.correspondenceForm.get("attachments") as FormArray;
  }

  addAttachment(): void {
    this.attachments.push(
      this.fb.group({
        name: ["", Validators.required],
        description: [""],
        file: [null]
      })
    );
  }

  removeAttachment(index: number): void {
    this.attachments.removeAt(index);
  }

  onFileSelected(event: any, index: number): void {
    const file: File = event.target.files[0];
    if (file) {
      this.attachments.at(index).patchValue({
        file: file,
        name: file.name
      });
    }
  }

  onCancel(): void {
    // Regresa a la página anterior
    this.location.back();
    
    // Alternativa: puedes usar un router.navigate si prefieres ir a una ruta específica
    // this.router.navigate(['/correspondence/list']);
  }
}