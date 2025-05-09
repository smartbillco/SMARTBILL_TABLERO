import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../model/user';
import { Role } from '../model/role';
import { GenericService } from '../../../pages/service/generic.service';
import { UserConfig } from '../model/user-config';

interface ApiResponse {
  success: boolean;
  message: string;
  data: User;
}

interface UserConfigResponse {
  success: boolean;
  message: string;
  data: UserConfig;
}


@Injectable({
  providedIn: 'root'
})
export class UserService extends GenericService<User> {
  private baseUrl = `${environment.HOST_SEGURITY}/users`;
 
  private userChange: Subject<User[]> = new Subject<User[]>();
  private messageChange: Subject<string> = new Subject<string>();
  
  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST_SEGURITY}/users`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`);
  }

  registerUser(user: User, photo: File): Observable<ApiResponse> {
    const formData = new FormData();

    Object.entries(user).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== "photo" && key !== "acceptTerms") {
        if (key === "roles") {
          const rolesData = (value as Role[]).map(role => ({
            idRole: role.idRole,
            name: role.name
          }));
          formData.append("roles", JSON.stringify(rolesData));
        } else if (key === "regime") {
          formData.append(key, value ? value.toString() : '');
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    formData.append("photo", photo);
    return this.http.post<ApiResponse>(`${environment.HOST_SEGURITY}/auth/register`, formData);
  }

  updateUserPhoto(userId: number, photo: File): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('photo', photo);
    
    return this.http.put<ApiResponse>(`${this.baseUrl}/${userId}/photo`, formData);
  }

  deleteUserPhoto(userId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/photo/${userId}`);
  }

  // Actualizar configuración del usuario
  updateUserConfig(userConfigRequest: UserConfig): Observable<UserConfigResponse> {
    return this.http.put<UserConfigResponse>(`${this.baseUrl}/config/update`, userConfigRequest);
  }

  // Obtener configuración por ID de usuario
  getUserConfigById(id: number): Observable<UserConfigResponse> {
    return this.http.get<UserConfigResponse>(`${this.baseUrl}/config/${id}`);
  }

  // Obtener configuración por nombre de usuario
  getUserConfigByUsername(username: string): Observable<UserConfigResponse> {
    return this.http.get<UserConfigResponse>(`${this.baseUrl}/config/username/${username}`);
  }



  // Listar usuarios paginados
  listPageable(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.url}/pageable?page=${page}&size=${size}`);
  }

  // Buscar usuario por ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  // Buscar usuario por username
  getUserByUsername(username: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.url}/username/${username}`);
  }

  // Buscar usuario por email
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.url}/email/${email}`);
  }

  // Actualizar usuario con FormData (ej. imagen, datos)
  updateUser(userId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.url}/${userId}`, formData);
  }

  // Eliminar usuario
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }


  // === Subject para cambio de lista de usuarios ===
  setUserChange(data: User[]) {
    this.userChange.next(data);
  }

  getUserChange(): Observable<User[]> {
    return this.userChange.asObservable();
  }

  // === Subject para mostrar mensajes ===
  setMessageChange(message: string) {
    this.messageChange.next(message);
  }

  getMessageChange(): Observable<string> {
    return this.messageChange.asObservable();
  }
}