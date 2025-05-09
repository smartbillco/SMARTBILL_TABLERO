import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, } from 'rxjs/operators';
import { DocType } from '../../module/user-management/model/doctype';
import { Regime } from '../../module/user-management/model/regime';
import { Role } from '../../module/user-management/model/role';
import { ApiResponse, User } from '../../module/user-management/model/user';
import { DocTypeService } from '../../module/user-management/service/doctype.service';
import { RegimeService } from '../../module/user-management/service/regime.service';
import { RoleService } from '../../module/user-management/service/role.service';
import { UserService } from '../../module/user-management/service/user.service';

@Injectable()
export class EditProfileService {
  constructor(
    private regimeService: RegimeService,
    private doctypeService: DocTypeService,
    private roleService: RoleService,
    private userService: UserService
  ) {}

  loadInitialUserData(username: string): Observable<User | null> {
    return this.userService.getUserByUsername(username).pipe(
      map(response => response?.data || null),
      catchError(() => of(null))
    );
  }

  loadSelectData(): Observable<{
    regimes: Regime[];
    doctypes: DocType[];
    roles: Role[];
  }> {
    return forkJoin({
      regimes: this.regimeService.findAll().pipe(
        catchError(() => of([]))
      ),
      doctypes: this.doctypeService.findAll().pipe(
        catchError(() => of([]))
      ),
      roles: this.roleService.findAll().pipe(
        catchError(() => of([]))
      ),
    });
  }
  

  updateUserProfile(userId: number, formData: FormData): Observable<ApiResponse<User>> {
    return this.userService.updateUser(userId, formData);
  }
}