import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class XMLInvoiceDataExtractorService {
  constructor() {}

  /*-----------------------------------------------------------------------*/
  extractDescriptions(
    variablesArray: any[],
    descriptionsItemArray: string[]
  ): void {
    try {
      // Verifica que el array no esté vacío
      if (!variablesArray || variablesArray.length === 0) {
        //console.error("El array de variables está vacío o no definido.");
        alert("El array de variables está vacío o no definido.");
        return;
      }

      // Itera sobre el array y extrae las descripciones de los items
      const descriptions = variablesArray.flatMap((variable, index) => {
        /*alert(
          `Procesando elemento ${index}: ${JSON.stringify(variable, null, 2)}`
        );*/
        // Navega a `gItem` dentro de cada variable y obtiene las descripciones
        return variable?.value?.xFe?.rFE?.gItem
          ?.map((item: any) => {
            const desc = item?.dDescProd;
            if (desc) {
              console.log(`Descripción encontrada: ${desc}`);
              return desc;
            }
            return null;
          })
          .filter(Boolean); // Filtra valores nulos o indefinidos
      });

      // Verifica si se encontraron descripciones
      if (descriptions.length === 0) {
        //console.warn("No se encontraron descripciones válidas.");
        alert("No se encontraron descripciones válidas.");
        return;
      }

      // Añade las descripciones extraídas al array final
      descriptionsItemArray.push(...descriptions);

      // Imprime las descripciones extraídas
      //console.log("Descripciones extraídas:", descriptions);
      //alert("Descripciones extraídas: " + descriptions.join(", "));
    } catch (error) {
      // Maneja errores durante el proceso
      //console.error("Error en extractDescriptions:", error);
      alert("Ocurrió un error al procesar las descripciones.");
    }
  }
  /*-----------------------------------------------------------------------*/
  extractPrices(variablesArray: any[], precioItemArray: number[]): void {
    try {
      // Verificación si el array de variables está vacío o no definido
      if (!variablesArray || variablesArray.length === 0) {
        //console.error("El array de variables está vacío o no definido.");
        alert("El array de variables está vacío o no definido.");
        return;
      }

      // Procesamos los precios
      const precios = variablesArray.flatMap((variable, index) => {
        //alert(`Procesando variable completa: ${JSON.stringify(variable, null, 2)}`);

        // Acceder a los items de la variable
        const items = variable?.value?.xFe?.rFE?.gItem;
        if (!items) {
          //console.warn(`No se encontraron items en la variable index ${index}`);
          alert(`No se encontraron items en el índice ${index}`);
          return [];
        }

        //alert(`Items encontrados: ${JSON.stringify(items, null, 2)}`);

        // Extraer el precio de cada item
        return items
          .map((item: any, itemIndex: number) => {
            const precio = item?.gPrecios?.dPrItem;
            if (!precio || isNaN(parseFloat(precio))) {
              //console.warn(`No se encontró un precio válido en el item index ${itemIndex}`);
              alert(
                `No se encontró un precio válido en el índice ${itemIndex}`
              );
              return null;
            }
            //console.log(`Precio encontrado: ${precio}`);
            return parseFloat(precio); // Convertir el precio a número
          })
          .filter((precio) => precio !== null && !isNaN(precio)); // Filtramos valores nulos o inválidos
      });

      // Verificar si se encontraron precios válidos
      if (precios.length === 0) {
        //console.warn("No se encontraron precios válidos.");
        alert("No se encontraron precios válidos.");
        return;
      }

      // Agregar los precios al array de precios
      precioItemArray.push(...precios);

      //console.log("Precios extraídos:", precios);
      //alert("Precios extraídos: " + precios.join(", "));
    } catch (error) {
      //console.error("Error en extractPrices:", error);
      alert("Ocurrió un error al procesar los precios.");
    }
  }

  /*-----------------------------------------------------------------------*/
  extractTaxValues(variablesArray: any[], precioItemArray: number[]): void {
    try {
      // Verificación si el array de variables está vacío o no definido
      if (!variablesArray || variablesArray.length === 0) {
        //console.error("El array de variables está vacío o no definido.");
        alert("El array de variables está vacío o no definido.");
        return;
      }

      // Procesamos los precios
      const precios = variablesArray.flatMap((variable, index) => {
        //console.log(`Procesando variable completa:`, variable);

        // Acceder a los items de la variable
        const items = variable?.value?.xFe?.rFE?.gItem;
        if (!items) {
          console.warn(`No se encontraron items en la variable index ${index}`);
          return [];
        }

        console.log(`Items encontrados:`, items);

        // Extraer el impuesto de cada ítem, manteniendo el orden
        return items.map((item: any, itemIndex: number) => {
          const impuesto = item?.gITBMSItem?.dValITBMS;

          // Si no hay un impuesto válido o está vacío, devolver 0
          if (
            impuesto === undefined ||
            impuesto === null ||
            isNaN(parseFloat(impuesto))
          ) {
            console.warn(
              `No se encontró un impuesto válido en el item index ${itemIndex}. Se asignará 0.`
            );
            return 0; // Asignamos 0 si no es un valor válido
          }

          //console.log(`Impuesto encontrado: ${impuesto}`);
          return parseFloat(impuesto); // Convertir a número
        });
      });

      // Verificar si se encontraron valores válidos
      if (precios.length === 0) {
        //console.warn("No se encontraron valores de impuestos válidos.");
        alert("No se encontraron valores de impuestos válidos.");
        return;
      }

      // Agregar los valores al array de precios
      precioItemArray.push(...precios);

      //console.log("Valores de impuestos extraídos:", precios);
      //alert("Valores de impuestos extraídos: " + precios.join(", "));
    } catch (error) {
      //console.error("Error en extractTaxValues:", error);
      alert("Ocurrió un error al procesar los valores de impuestos.");
    }
  }

  /*-----------------------------------------------------------------------*/
  extractTaxClasses(variablesArray: any[], taxSchemeNames: string[]): void {
    try {
      // Verificación si el array de variables está vacío o no definido
      if (!variablesArray || variablesArray.length === 0) {
        //console.error("El array de variables está vacío o no definido.");
        alert("El array de variables está vacío o no definido.");
        return;
      }

      // Procesamos los precios
      const impuestos = variablesArray.flatMap((variable, index) => {
        //console.log(`Procesando variable completa:`, variable);

        // Acceder a los items de la variable
        const items = variable?.value?.xFe?.rFE?.gItem;
        if (!items) {
          //console.warn(`No se encontraron items en la variable index ${index}`);
          return [];
        }

        //console.log(`Items encontrados:`, items);

        // Extraer el impuesto de cada ítem, manteniendo el orden
        return items.map((item: any, itemIndex: number) => {
          const impuesto = item?.gITBMSItem?.dValITBMS;

          // Si no hay un impuesto válido o está vacío, devolver 0
          if (
            impuesto === undefined ||
            impuesto === null ||
            isNaN(parseFloat(impuesto))
          ) {
            console.warn(
              `No se encontró un impuesto válido en el item index ${itemIndex}. Se asignará 0.`
            );
            return { name: "ImpPanama" }; // Solo devolver el nombre
          }

          //console.log(`Impuesto encontrado: ${impuesto}`);
          return { name: "ImpPanama" }; // Devolver solo el nombre
        });
      });

      // Verificar si se encontraron valores válidos
      if (impuestos.length === 0) {
        console.warn("No se encontraron valores de impuestos válidos.");
        alert("No se encontraron valores de impuestos válidos.");
        return;
      }

      // Agregar los nombres de impuestos al array taxSchemeNames
      taxSchemeNames.push(...impuestos.map((impuesto) => impuesto.name));

      //console.log("Impuestos extraídos:", impuestos);
      //alert("Impuestos extraídos: " + impuestos.map(impuesto => impuesto.name).join(", "));
    } catch (error) {
      console.error("Error en extractTaxClasses:", error);
      alert("Ocurrió un error al procesar los impuestos.");
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
    return value && typeof value === "object" && !Array.isArray(value);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  convertDescriptionToVariables(description: any): any[] {
    return Object.keys(description).map((key) => ({
      key,
      value: description[key],
    }));
  }
}

interface InvoiceLine {
  [key: string]: any; // Ajusta el tipo según la estructura real
}
