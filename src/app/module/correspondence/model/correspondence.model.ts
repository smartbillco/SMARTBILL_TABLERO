export interface Attachment {
  id: string;               // ID opcional para adjuntos existentes
  correspondenceId: string;  // ID de la correspondencia
  name: string;              // Nombre del archivo (obligatorio)
  description?: string;      // Descripción opcional
  fileUrl?: string;          // URL del archivo si ya está almacenado
  file?: File;               // Objeto File solo para frontend (no se envía al backend)
  isNew?: boolean;           // Bandera solo para frontend (manejo interno)
}


// Interfaz para el remitente de la correspondencia
export interface Sender {
  idUser: number; // ID único del usuario remitente
  userName: string; // Nombre de usuario
  firstName: string; // Primer nombre del remitente
  lastName: string; // Apellido del remitente
  documentType: string; // Tipo de documento de identidad
  documentNumber: string; // Número de documento de identidad
  phoneNumber: string; // Número de teléfono
  email: string; // Correo electrónico
  address: string; // Dirección del remitente
  enabled?: boolean; // Estado del usuario (activo/inactivo)
}

// Interfaz para el tipo de correspondencia
export interface CorrespondenceType {
  codCorrespondenceType: number; // Código único del tipo de correspondencia
  descripcion: string; // Descripción del tipo de correspondencia
}

// Interfaz para el estado del documento
export interface DocumentStatus {
  codDocumentStatus: number; // Código único del estado del documento
  descripcion: string; // Descripción del estado del documento
}

// Interfaz para el subtipo de correspondencia
export interface CorrespondenceCategory {
  codCorrespondenceCategory: string;       
  descripcion: string;     
  expiresInDays: number;    
}

// Interfaz para el departamento involucrado
export interface Dependence
{
  codDependence
  : string; // Código del departamento o área
  descripcion: string; // Nombre del área o departamento
}


// Interfaz principal que agrupa toda la información de la correspondencia
export interface CorrespondenceData {
  filingNumber: string; // Número de radicado de la correspondencia
  filingDate: string; // Fecha de radicación (ISO 8601: YYYY-MM-DD)
  documentDate: string; // Fecha del documento original (ISO 8601: YYYY-MM-DD)
  externalFiling?: string; // Número de radicación externa (opcional)
  status: string; // Estado actual de la correspondencia
  subject: string; // Asunto de la correspondencia
  text: string; // Contenido o descripción de la correspondencia
  attachments: Attachment[]; // Lista de archivos adjuntos
  senders: Sender; // Remitente
  correspondenceType: CorrespondenceType; // Tipo de correspondencia
  documentStatus: DocumentStatus; // Estado del documento
  correspondenceCategory?: CorrespondenceCategory; // Subtipo de correspondencia (opcional)
  dependence: Dependence  ; // Departamento responsable
  recipients?: Sender; // destinatario (opcional, si aplica)
}


// Interfaz para la respuesta de la API al crear correspondencia
export interface CorrespondenceResponse {
  success: boolean;
  message: string;
  data?: any;
}
