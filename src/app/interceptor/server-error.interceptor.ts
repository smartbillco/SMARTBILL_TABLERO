import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, retryWhen, scan, tap } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Router } from "@angular/router";
import { NotificationService } from "../pages/service/notification.service";
import { AuthService } from "../pages/service/auth.service";

@Injectable({
    providedIn: 'root'
})
export class ServeErrorsInterceptor implements HttpInterceptor {

    constructor(
        private notificationService: NotificationService,
        private router: Router,
        private authService: AuthService  // <-- Agrega la inyección del servicio de autenticación

    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            retryWhen(errors => 
                errors.pipe(
                    scan((retryCount, error) => {
                        if (error instanceof HttpErrorResponse) {
                            // Si el servidor está caído (status 0), no reintentar
                            if (error.status === 0) {
                                throw error;
                            }
                            // Reintentar solo en errores 502, 503, 504 si no se ha alcanzado el límite
                            if ([502, 503, 504].includes(error.status) && retryCount < environment.RETRY) {
                                return retryCount + 1;
                            }
                        }
                        throw error;
                    }, 0)
                )
            ),
            tap(event => {
                if (event instanceof HttpResponse && event.body?.success === false) {
                    this.notificationService.showError(event.body.message || 'Error desconocido');
                    throw new Error(event.body.message || 'Error desconocido');
                }
            }),
            catchError(err => {
                this.handleHttpError(err);
                return throwError(() => err);
            })
        );
    }

    private handleHttpError(err: any): void {
        const errorMessages: Record<number, string> = {
            400: 'Solicitud incorrecta',
            401: 'No autorizado. Redirigiendo al inicio de sesión...',
            403: 'Acceso denegado',
            404: 'Recurso no encontrado en el Backend',
            500: 'Error interno del servidor',
            502: 'El servidor no responde (Bad Gateway)',
            503: 'El servicio no está disponible temporalmente',
            504: 'Tiempo de espera agotado al comunicarse con el servidor'
        };

        // Manejo del error cuando el servidor está caído
        if (err instanceof HttpErrorResponse && err.status === 0) {
            this.notificationService.showError('No se pudo conectar con el servidor. Verifique su conexión o intente más tarde.', 'Servidor inalcanzable');
            console.error("Error HTTP: Servidor caído o sin conexión.");
            return;
        }

        const errorMessage = err.error?.message || errorMessages[err.status] || 'Ocurrió un error inesperado';
        this.notificationService.showError(errorMessage, `Error ${err.status || ''}`);

        console.error("Error HTTP:", err);

        if ([502, 503, 504].includes(err.status)) {
            this.notificationService.showWarning('El servidor no está disponible. Inténtelo más tarde.', 'Servidor fuera de línea');
        }

        if (err.status === 401) {
            sessionStorage.clear();
            this.router.navigate(['/login']);
        }

        if (!navigator.onLine) {
            this.notificationService.showWarning('Sin conexión a Internet', 'Red');
        }
    }
}
