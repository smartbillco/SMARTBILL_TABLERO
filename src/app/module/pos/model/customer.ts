export class Customer {
    idCustomer: number; // Id del cliente    
    idRegime: number; // Id del regimen
    idDoctype: number; // Id del tipo documento
    firstName: string; // Nombre del cliente
    lastName: string; // Apellido del cliente
    documentNumber: string; // Número de documento
    phoneNumber: string; // Número de teléfono
    address?: string; // Dirección (opcional)
    email: string; // Correo electrónico
    dateOfBirth: Date; // Fecha de nacimiento
    photo_url: string; //Foto
}