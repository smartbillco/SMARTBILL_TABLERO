import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class XMLInvoiceDataExtractorService {

  constructor() {}

  /*-----------------------------------------------------------------------*/
  extractDescriptions(variablesArray: any[], descriptionsItemArray: string[]): void {
    try {
      variablesArray.forEach(variable => {
        if (variable.key === 'cac:Item' && variable.value['cbc:Description']) {
          const descriptionsItem = variable.value['cbc:Description'];    
  
          //alert(JSON.stringify(descriptionsItem, null, 2));
  
          if (Array.isArray(descriptionsItem)) {
            descriptionsItem.forEach((desc: any) => {
              if (desc._text) {
                descriptionsItemArray.push(desc._text);
              } else if (desc._cdata) {
                descriptionsItemArray.push(desc._cdata);
              } else {
                descriptionsItemArray.push(desc);
              }
            });
          } else {
            if (descriptionsItem._text) {
              descriptionsItemArray.push(descriptionsItem._text);
            } else if (descriptionsItem._cdata) {
              descriptionsItemArray.push(descriptionsItem._cdata);
            } else {
              descriptionsItemArray.push(descriptionsItem);
            }
          }
        } else if (this.isObject(variable.value) || this.isArray(variable.value)) {
          this.extractDescriptions(this.convertDescriptionToVariables(variable.value), descriptionsItemArray);
        }
      });
    } catch (error) {
      this.handleError(error, 'extractdescriptionsItem');
    }
  }
  /*-----------------------------------------------------------------------*/
  extractPrices(variablesArray: any[], precioItemArray: number[]): void {
      try {
        variablesArray.forEach(variable => {
          if (variable.key === 'cac:InvoiceLine') {
            if (Array.isArray(variable.value)) {
              (variable.value as InvoiceLine[]).forEach((item: InvoiceLine) => {
                if (this.isObject(item)) {
                  const invoiceLineValue = this.convertDescriptionToVariables(item);
                  invoiceLineValue.forEach(subVariable => {
                    this.processSubVariablesx(subVariable, precioItemArray);
                  });
                }
              });
            } else if (this.isObject(variable.value)) {
              const invoiceLineValue = this.convertDescriptionToVariables(variable.value);
              invoiceLineValue.forEach(subVariable => {
                this.processSubVariablesx(subVariable, precioItemArray);
              });
            }
          } else if (this.isObject(variable.value) || this.isArray(variable.value)) {
            this.extractPrices(this.convertDescriptionToVariables(variable.value), precioItemArray);
          }
        });
      } catch (error) {
        this.handleError(error, 'extractimpuestovalorItem');
      }
    }
  
    processSubVariablesx(subVariable: any, precioItemArray: number[]): void {
      if (subVariable.key === 'cac:TaxTotal' && this.isObject(subVariable.value)) {
        const taxTotalValue = this.convertDescriptionToVariables(subVariable.value);
  
        taxTotalValue.forEach((taxSubVariable: any) => {
          if (taxSubVariable.key === 'cac:TaxSubtotal') {
            const taxAmount = taxSubVariable.value['cbc:TaxableAmount'];
            if (taxAmount) {
              if (Array.isArray(taxAmount)) {
                taxAmount.forEach((amount: any) => {
                  precioItemArray.push(parseFloat(amount._text || amount));
                });
              } else {
                precioItemArray.push(parseFloat(taxAmount._text || taxAmount));
              }
            }
          }
        });
      }
    }
  /*-----------------------------------------------------------------------*/
  extractTaxValues(variablesArray: any[], precioItemArray: number[]): void {
    try {
      variablesArray.forEach(variable => {
        if (variable.key === 'cac:InvoiceLine') {
          if (Array.isArray(variable.value)) {
            (variable.value as InvoiceLine[]).forEach((item: InvoiceLine) => {
              if (this.isObject(item)) {
                const invoiceLineValue = this.convertDescriptionToVariables(item);
                invoiceLineValue.forEach(subVariable => {
                  this.processSubVariables(subVariable, precioItemArray);
                });
              }
            });
          } else if (this.isObject(variable.value)) {
            const invoiceLineValue = this.convertDescriptionToVariables(variable.value);
            invoiceLineValue.forEach(subVariable => {
              this.processSubVariables(subVariable, precioItemArray);
            });
          }
        } else if (this.isObject(variable.value) || this.isArray(variable.value)) {
          this.extractTaxValues(this.convertDescriptionToVariables(variable.value), precioItemArray);
        }
      });
    } catch (error) {
      this.handleError(error, 'extractimpuestovalorItem');
    }
  }

  processSubVariables(subVariable: any, precioItemArray: number[]): void {
    if (subVariable.key === 'cac:TaxTotal' && this.isObject(subVariable.value)) {
      const taxTotalValue = this.convertDescriptionToVariables(subVariable.value);

      taxTotalValue.forEach((taxSubVariable: any) => {
        if (taxSubVariable.key === 'cac:TaxSubtotal') {
          const taxAmount = taxSubVariable.value['cbc:TaxAmount'];
          if (taxAmount) {
            if (Array.isArray(taxAmount)) {
              taxAmount.forEach((amount: any) => {
                precioItemArray.push(parseFloat(amount._text || amount));
              });
            } else {
              precioItemArray.push(parseFloat(taxAmount._text || taxAmount));
            }
          }
        }
      });
    }
  }

  /*-----------------------------------------------------------------------*/
  extractTaxClasses(variablesArray: any[], taxSchemeNames: string[]): void {
    try {
      variablesArray.forEach(variable => {
        if (variable.key === 'cac:InvoiceLine') {
          if (Array.isArray(variable.value)) {
            (variable.value as InvoiceLine[]).forEach((item: InvoiceLine) => {
              if (this.isObject(item)) {
                const invoiceLineValue = this.convertDescriptionToVariables(item);
                invoiceLineValue.forEach(subVariable => {
                  this.procesoSubVariables(subVariable, taxSchemeNames);
                });
              }
            });
          } else if (this.isObject(variable.value)) {
            const invoiceLineValue = this.convertDescriptionToVariables(variable.value);
            invoiceLineValue.forEach(subVariable => {
              this.procesoSubVariables(subVariable, taxSchemeNames);
            });
          }
        } else if (this.isObject(variable.value) || this.isArray(variable.value)) {
          this.extractTaxClasses(this.convertDescriptionToVariables(variable.value), taxSchemeNames);
        }
      });
    } catch (error) {
      this.handleError(error, 'extractimpuestoclaseItem');
    }
  }

  procesoSubVariables(subVariable: any, taxSchemeNames: string[]): void {
    if (subVariable.key === 'cac:TaxTotal' && this.isObject(subVariable.value)) {
      const taxTotalValue = this.convertDescriptionToVariables(subVariable.value);
      taxTotalValue.forEach((taxSubVariable: any) => {
        if (taxSubVariable.key === 'cac:TaxSubtotal' && this.isObject(taxSubVariable.value)) {
          const taxSubValueArray = Array.isArray(taxSubVariable.value) ? taxSubVariable.value : [taxSubVariable.value];

          taxSubValueArray.forEach((subSubVariable: any) => {
            if ('cac:TaxCategory' in subSubVariable && this.isObject(subSubVariable['cac:TaxCategory'])) {
              const taxCategory = subSubVariable['cac:TaxCategory'];
              const taxScheme = taxCategory['cac:TaxScheme'];

              if (taxScheme && this.isObject(taxScheme)) {
                this.extractTaxSchemeNames(taxScheme, taxSchemeNames);
              }
            }
          });
        }
      });
    }
  }

  extractTaxSchemeNames(taxScheme: any, taxSchemeNames: string[]): void {
    try {
      if (taxScheme['cbc:Name']) {
        const taxSchemeName = taxScheme['cbc:Name'];
        if (Array.isArray(taxSchemeName)) {
          taxSchemeName.forEach((name: any) => {
            taxSchemeNames.push(name._text || name);
          });
        } else {
          taxSchemeNames.push(taxSchemeName._text || taxSchemeName);
        }
      }
    } catch (error) {
      this.handleError(error, 'extractTaxSchemeNames');
    }
  }

  /*-----------------------------------------------------------------------*/
  private handleError(error: unknown, methodName: string): void {
    if (error instanceof Error) {
      console.error(`Error en ${methodName}: ${error.message}`);
      throw new Error(`Error en ${methodName}: ${error.message}`);
    } else {
      console.error(`Error desconocido en ${methodName}`);
      throw new Error(`Error desconocido en ${methodName}`);
    }
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  convertDescriptionToVariables(description: any): any[] {
    return Object.keys(description).map(key => ({ key, value: description[key] }));
  }
}

interface InvoiceLine {
  [key: string]: any; // Ajusta el tipo según la estructura real
}