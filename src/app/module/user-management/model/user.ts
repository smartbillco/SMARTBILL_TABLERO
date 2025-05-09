import { AppModule } from "./appmodule";

export interface User {
    idUser: number;
    username: string;        // Nombre usuario
    firstName: string;       // Primer nombre
    secondName?: string;     // Segundo nombre (opcional)
    lastName: string;        // Primer apellido
    secondLastName?: string; // Segundo apellido (opcional)
    documentType: string;    // Tipo de documento
    documentNumber: string;  // Número de documento
    phoneNumber: string;     // Número de teléfono
    enabled: boolean;        // Indica si el usuario está habilitado
    address: string;         // Dirección
    email: string;           // Correo electrónico
    password?: string;       // Contraseña (opcional)
    regime?: string;         // Régimen (opcional)
    modules?: Array<{        // Módulos asociados (opcional)
        idModule: number;
        descriptionModule: string;
        nameModule: string;
    }>;
    photo_url?: string;      // URL de la foto de perfil (opcional)
    roles?: Array<{          // Roles del usuario (opcional)
        idRole: number;      // ID del rol (notar cambio de id_role a idRole)
        name: string;       // Nombre del rol
    }>;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    // otras propiedades comunes de tu API
  }