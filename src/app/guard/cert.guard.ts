import { inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { first, map, catchError, of } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "../pages/service/auth.service";
import { AppMenuService } from "../pages/service/app-menus.service";

// 🚀 Guardia de autenticación y autorización
export const certGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const loginService = inject(AuthService);
  const menuService = inject(AppMenuService);
  const router = inject(Router);
  const helper = new JwtHelperService();

  const token = sessionStorage.getItem(environment.TOKEN_NAME);

  // 🔍 Verifica si el usuario está autenticado y el token es válido
  if (!loginService.isLogged() || !token || isInvalidToken(token, helper)) {
    loginService.logout();
    router.navigateByUrl("/module/not-403");
    return false;
  }

  const decodedToken = helper.decodeToken(token);
  const username = decodedToken?.sub;
  if (!username) {
    loginService.logout();
    router.navigateByUrl("/module/not-403");
    return false;
  }

  // ⚡ Verifica si los menús están en caché
  const cachedMenus = sessionStorage.getItem("user_menus");
  if (cachedMenus) {
    return checkAccess(JSON.parse(cachedMenus), state.url, router);
  }

  // 📌 Obtiene los menús desde el servicio si no están en caché
  return menuService.getMenusByUser(username).pipe(
    first(),
    map((response: any) => {
      const data = response?.data;
      if (!Array.isArray(data)) {
        loginService.logout();
        router.navigateByUrl("/module/not-403");
        return false;
      }

      sessionStorage.setItem("user_menus", JSON.stringify(data)); // Guarda en caché
      return checkAccess(data, state.url, router);
    }),
    catchError(() => {
      loginService.logout();
      router.navigateByUrl("/module/not-403");
      return of(false);
    })
  );
};

// ✅ Verifica si el usuario tiene acceso a la URL solicitada
function checkAccess(menus: any[], url: string, router: Router): boolean {
  return (
    menus.some((menu) => url.startsWith(menu.url)) ||
    (router.navigateByUrl("/module/not-403"), false)
  );
}

// 🔍 Valida si el token es inválido o ha expirado
function isInvalidToken(token: string, helper: JwtHelperService): boolean {
  try {
    return token.split(".").length !== 3 || helper.isTokenExpired(token);
  } catch (error) {
    console.error("Error al validar el token:", error);
    return true;
  }
}
