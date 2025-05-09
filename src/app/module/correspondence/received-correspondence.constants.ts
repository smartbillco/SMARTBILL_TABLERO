export const STATUS_CLASSES: Record<number, string> = {
    1: "text-primary",
    2: "text-success",
    3: "text-secondary",
    4: "text-info",
    7: "text-warning",
    10: "text-danger",
    11: "text-primary",
  };
  
  export interface FieldConfig {
    key: string;
    label: string;
    defaultVisible?: boolean;
    sortable?: boolean;
  }
  
  export const FIELD_CONFIG: FieldConfig[] = [
    { key: "filingNumber", label: "N° Radicado", defaultVisible: true, sortable: true },
    { key: "filingDate", label: "Fecha Radicación", defaultVisible: true, sortable: true },
    { key: "documentDate", label: "Fecha Documento", defaultVisible: false, sortable: true },
    { key: "externalFiling", label: "Radicación Externa", defaultVisible: false, sortable: true },
    { key: "senderName", label: "Nombre Remitente", defaultVisible: true, sortable: true },
    { key: "subject", label: "Asunto", defaultVisible: true, sortable: true },
    { key: "content", label: "Contenido", defaultVisible: false, sortable: false },
    { key: "type", label: "Tipo", defaultVisible: false, sortable: true },
    { key: "status", label: "Estado", defaultVisible: true, sortable: true },
    { key: "category", label: "Categoría", defaultVisible: false, sortable: true },
    { key: "expiresInDays", label: "Días Expiración", defaultVisible: false, sortable: true },
    { key: "department", label: "Área", defaultVisible: true, sortable: true },
  ];
  
  export const DEFAULT_PAGE_SIZE = 5;
  export const COLUMN_PREFERENCES_KEY = "columnPreferences";