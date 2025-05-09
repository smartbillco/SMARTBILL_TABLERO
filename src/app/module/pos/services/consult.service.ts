import { Injectable } from '@angular/core';
import { environment } from "../../../../environments/environment";
import { HttpClient } from '@angular/common/http';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ConsultService {

  private url: string = `${environment.HOST_DATOS}/consults`;

  constructor(private http: HttpClient) { }

  callProcedureOrFunction(){
    return this.http.get<any>(`${this.url}/callProcedureNative`);
  }

  //pdf
  generateReport(){
    return this.http.get(`${this.url}/generateReport`, { responseType: 'blob'});
  }

 readFile(id: number){
    return this.http.get(`${this.url}/readFile/${id}`, { responseType: 'blob'});
  }

    saveFile(data: File, Analyst: { 
      idAnalyst: number,
      idRegime: number,
      idDoctype: number,
      firstName: string,
      lastName: string,
      documentNumber: string,
      phoneNumber: string,
      address: string,
      email: string,
      dateOfBirth: string
  }){
      const formdata: FormData = new FormData();
  
      // Agregamos los campos al FormData
      formdata.append('idAnalyst', Analyst.idAnalyst.toString());
      formdata.append('idRegime', Analyst.idRegime.toString());
      formdata.append('idDoctype', Analyst.idDoctype.toString());
      formdata.append('idFile', Analyst.idRegime.toString());

      formdata.append('firstName', Analyst.firstName);
      formdata.append('lastName', Analyst.lastName);
      formdata.append('documentNumber', Analyst.documentNumber);
      formdata.append('phoneNumber', Analyst.phoneNumber);
      formdata.append('address', Analyst.address);
      formdata.append('email', Analyst.email);
      
      // Formatear la fecha antes de agregarla
      //const formattedDate = new Date(Analyst.dateOfBirth).toISOString(); // o cualquier formato que necesites
      
      formdata.append('dateOfBirth', format(Analyst.dateOfBirth, "yyyy-MM-dd'T'HH:mm:ss"));
      
      // Agregar el archivo
      formdata.append('file', data);
      
      // Realizar la petición POST
      return this.http.post(`${this.url}/saveFile`, formdata);
  }
  
  /*
  // Ejemplo de uso
  const exampleFile = new File(["Contenido de ejemplo"], "ejemplo.txt", { type: "text/plain" });
  
  const AnalystData = {
      idAnalyst: "1",
      idRegime: "1",
      idDoctype: "1",
      firstName: "John",
      lastName: "Doe",
      documentNumber: "123456789",
      phoneNumber: "9876543210",
      address: "123 Main St, Springfield",
      email: "john.doe@example.com",
      dateOfBirth: "1990-01-01"
  };*/
  
  /*
  // Llamar a la función con el archivo y datos del cliente
  this.saveFile(exampleFile, AnalystData).subscribe(response => {
      console.log('File uploaded successfully', response);
  }, error => {
      console.error('Error uploading file', error);
  });*/


}
