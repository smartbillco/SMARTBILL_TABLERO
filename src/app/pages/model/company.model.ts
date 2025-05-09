  // Interfaces principales
  export interface Customer {
    id: string;
    cliente: string;
  }

  export interface UploadedFile {
    file: File;
    status: "invalid" | "valid" | "pending";
  }

  export interface Company {
    expanded: boolean;
    validated: "pending" | "valid" | "invalid";
    id: string;
    registrationName: string;
    totalBilledConverted : number; 
    invoices: Invoice[];
  }

  export interface Invoice {
    expanded: boolean;
    id: string;
    cliente: string;
    companyEmail: string;
    documentReference: string;
    issueDate: Date;
    issueTime: string;
    totalFactura: number;
    totalFacturaFormatted: number;
    countries: Country[];
    descriptionsItem: string[];
    precioItem: number[];
    precioItemFormatted: number[];
    impuestoValorItem: number[];
    impuestoValorItemFormatted: number[];
    impuestoClaseItem: string[];
    xml_anidado: any;
  }

  export interface Country {
    countryId: string;
    name: string;
    flag: string;
    percentage: number;
    total: number;
    convertedTotal: number;
    currencySymbol: string;
  }
// Configuración de detalles de países
export const COUNTRY_DETAILS: {
  [key: string]: { name: string; symbol: string; rateKey: string; icon: string; coords: [number, number] };
} = {
  co: { name: "Colombia",       symbol: "₡",   rateKey: "COP", icon: "fi-fi-co", coords: [4.5709, -74.2973] },
  us: { name: "Estados Unidos", symbol: "$",   rateKey: "USD", icon: "fi-fi-us", coords: [37.0902, -95.7129] }, 
  pe: { name: "Peru",           symbol: "S/",  rateKey: "PEN", icon: "fi-fi-pe", coords: [-9.19, -75.0152] },
  pa: { name: "Panama",         symbol: "B./", rateKey: "PAB", icon: "fi-fi-pa", coords: [8.5379, -80.7821] },
  ec: { name: "Ecuador",        symbol: "$",   rateKey: "USD", icon: "fi-fi-ec", coords: [-1.8312, -78.1834] },
  cl: { name: "Chile",          symbol: "$",   rateKey: "CLP", icon: "fi-fi-cl", coords: [-35.6751, -71.5430] },
};

  // Función para obtener detalles del país
  export function getCountryDetails(countryCode: string) {
    return COUNTRY_DETAILS[countryCode] || null;
  };

  export interface Filter {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    countryId?: string;
  }