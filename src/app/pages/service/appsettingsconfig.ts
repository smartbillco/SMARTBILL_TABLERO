export interface AppSettingsConfig {
  selectedCurrencyKey: string; // Clave de la moneda seleccionada
  storageType: string; // Tipo de almacenamiento seleccionado
  selectedRepository: string; // Repositorio seleccionado
  selectedLanguage: string; // Idioma seleccionado
  smsNotifications: boolean; // Notificaciones por SMS activadas/desactivadas
  emailNotifications: boolean; // Notificaciones por correo electrónico activadas/desactivadas
  pushNotifications: boolean; // Notificaciones push activadas/desactivadas
  rutaServidor?: string; // Ruta del servidor (solo cuando el tipo de almacenamiento es "servidor")
  tagsInput: { value: string }[];  // extensiones de archivos como un array de objetos xml, pdf..
}
