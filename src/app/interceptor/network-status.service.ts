import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { AuthService } from "../pages/service/auth.service";
import { NotificationService } from "../pages/service/notification.service";

@Injectable()
export class NetworkStatusInterceptor implements HttpInterceptor {
  private static eventsRegistered = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {
    if (!NetworkStatusInterceptor.eventsRegistered) {
      window.addEventListener("online", () => this.resendOfflineRequests());
      window.addEventListener("offline", () => this.notifyOfflineStatus());
      NetworkStatusInterceptor.eventsRegistered = true;
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!navigator.onLine) {
      this.notifyOfflineStatus();
      this.saveRequest(req);
      return throwError(() => new Error("Sin conexión a Internet"));
    }

    const authToken = this.authService.getToken();
    const clonedRequest = authToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${authToken}` } })
      : req;

    return next.handle(clonedRequest).pipe(
      catchError((error) => {
        if (!navigator.onLine) this.saveRequest(req);
        return throwError(() => error);
      }),
      //finalize(() => this.progressBarService.setProgress(0))
    );
  }

  private notifyOfflineStatus() {
    this.notificationService.showWarning("No hay conexión a Internet, se respalda la informacion a manera local para luego ser sincronizada con el servidor", "Red");
  }

  private saveRequest(req: HttpRequest<any>) {
    const requestData = {
      url: req.url,
      method: req.method,
      body: req.body,
      headers: req.headers.keys().map((key) => ({
        key,
        value: req.headers.get(key),
      })),
    };

    const offlineRequests = this.getStoredOfflineRequests();
    offlineRequests.push(requestData);
    this.saveOfflineRequests(offlineRequests);

    console.warn("📌 Solicitud guardada:", req.url);
  }

  private async resendOfflineRequests() {

    const storedRequests = this.getStoredOfflineRequests();
    if (storedRequests.length === 0) return;

    this.notificationService.showSuccess("Conexión restablecida. Reenviando solicitudes y sincronizando con el servidor...", "Red");
    //this.progressBarService.setProgress(0);
    console.log("🔄 Conexión restablecida, intentando reenviar solicitudes...");

    const results = await Promise.allSettled(
      storedRequests.map((request) =>
        fetch(request.url, {
          method: request.method,
          body: request.body ? JSON.stringify(request.body) : null,
          headers: this.buildHeaders(request.headers),
        }).then((response) => ({ success: response.ok, url: request.url }))
      )
    );

    const successfulRequests = results
    .filter((result) => result.status === "fulfilled" && (result as PromiseFulfilledResult<{ success: boolean; url: any }>).value.success)
    .map((result) => (result as PromiseFulfilledResult<{ success: boolean; url: any }>).value.url);
  
    if (successfulRequests.length > 0) {
      this.removeOfflineRequests(successfulRequests);
      console.log("✅ Solicitudes reenviadas correctamente:", successfulRequests);
    } else {
      console.error("❌ No se pudieron reenviar algunas solicitudes.");
    }

    //this.progressBarService.completeProgress();
  }

  private buildHeaders(headers: any[]) {
    const headersObj = Object.fromEntries(headers.map((h) => [h.key, h.value]));

    const authToken = this.authService.getToken();
    if (authToken) {
      headersObj["Authorization"] = `Bearer ${authToken}`;
    }

    return headersObj;
  }

  private getStoredOfflineRequests(): any[] {
    return JSON.parse(localStorage.getItem("offlineRequests") || "[]");
  }

  private saveOfflineRequests(requests: any[]) {
    localStorage.setItem("offlineRequests", JSON.stringify(requests));
  }

  private removeOfflineRequests(urls: string[]) {
    const requests = this.getStoredOfflineRequests().filter((req) => !urls.includes(req.url));
    this.saveOfflineRequests(requests);
  }
}
