import { Injectable } from "@angular/core";
import { XMLParser } from "fast-xml-parser";

@Injectable({
  providedIn: "root",
})
export class XmlHelper {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser();
  }

  public validateXml(xmlDoc: Document): void {
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      throw new Error("Error al parsear el XML");
    }
  }

  public convertXmlToJson(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const result = this.xmlParser.parse(xml);
        resolve(result);
      } catch (error: unknown) {
        console.error("Error al convertir XML a JSON:", error);
        reject(error);
      }
    });
  }

  public readFileAsText(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  public convertDescriptionToVariables(descriptionJson: any): any[] {
    return Object.keys(descriptionJson).map((key) => ({
      key,
      value: descriptionJson[key],
    }));
  }

  public getEmptyData(): any {
    return {};
  }

  public handleError(error: unknown, customMessage: string): never {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${customMessage}: ${errorMessage}`);
    throw new Error(`${customMessage}: ${errorMessage}`);
  }

  public extractElementText(xmlDoc: Document, xpath: string): string {
    try {
      const resolver = xmlDoc.createNSResolver(xmlDoc.documentElement);
      const result = xmlDoc.evaluate(
        xpath,
        xmlDoc,
        resolver,
        XPathResult.STRING_TYPE,
        null
      );
      return result.stringValue.trim();
    } catch (error) {
      console.error(`Error al extraer texto con XPath '${xpath}': ${error}`);
      return "";
    }
  }
}
