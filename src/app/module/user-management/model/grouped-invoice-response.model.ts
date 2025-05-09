import { FileRequest } from "./file-request.model";

export interface GroupedInvoiceResponse {
  invoiceCode: string;
  files: FileRequest[];
}