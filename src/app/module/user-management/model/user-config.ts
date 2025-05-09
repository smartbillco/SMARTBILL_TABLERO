export interface UserConfig {
  currencyKey: string;       // Clave de la moneda (ej: 'USD', 'EUR')
  currency: string;          // Nombre completo de la moneda (ej: 'Dólar estadounidense')
  storageType: string;       // 's3' o 'local'
  language: string;          // Código de idioma (ej: 'es', 'en')
  smsNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}