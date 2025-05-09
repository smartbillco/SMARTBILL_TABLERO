import { importProvidersFrom, InjectionToken } from "@angular/core";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { HTTP_INTERCEPTORS } from "@angular/common/http";

import { PathLocationStrategy, LocationStrategy } from "@angular/common";

// Component Module
import { NgScrollbarModule, NG_SCROLLBAR_OPTIONS } from "ngx-scrollbar";
import { provideHighlightOptions } from "ngx-highlightjs";

// Firebase
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";

// Auth
import { JwtModule } from "@auth0/angular-jwt";

// Spinner
import { NgxSpinnerModule } from "ngx-spinner";

// Application-specific
import { ServeErrorsInterceptor } from "./interceptor/server-error.interceptor";
import { NetworkStatusInterceptor } from "./interceptor/network-status.service";
import { LoaderInterceptor } from "./interceptor/loader-interceptor";

// Animations
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { ToastrModule } from "ngx-toastr";

// Daterangepicker
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { environment } from "./../environments/environment";

// Token para recuperar el JWT
export function tokenGetter() {
  return sessionStorage.getItem(environment.TOKEN_NAME);
}

// Configuración para Daterangepicker
export const daterangepickerConfig = {
  locale: {
    format: "YYYY-MM-DD",
  },
  opens: "left",
};

// Token específico para Daterangepicker
export const DATERANGEPICKER_CONFIG = new InjectionToken<any>(
  "daterangepicker.config"
);

import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import {
  provideClientHydration,
  withEventReplay,
} from "@angular/platform-browser";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    // ✅ Se agrupan todos los interceptores en una sola configuración
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NetworkStatusInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServeErrorsInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },

    // JWT Module Configuration
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: [environment.HOST_S, environment.HOST_D],
          disallowedRoutes: [`${environment.HOST_SEGURITY}/login/forget`],
        },
      })
    ),

    // Inicialización de Firebase
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyBJ6oJrZtNd9xeBvsNS4-YsxZA3wqJkPxM",
        authDomain: "smartbill-6afe7.firebaseapp.com",
        projectId: "smartbill-6afe7",
        storageBucket: "smartbill-6afe7.appspot.com",
        messagingSenderId: "76607772376",
        appId: "1:76607772376:web:52152a203e9ac38a3fe9ad",
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

    // Configuración de NgScrollbar
    importProvidersFrom(NgScrollbarModule),
    {
      provide: NG_SCROLLBAR_OPTIONS,
      useValue: { visibility: "hover" },
    },

    // Configuración de Highlight.js
    provideHighlightOptions({
      fullLibraryLoader: () => import("highlight.js"),
      lineNumbersLoader: () => import("ngx-highlightjs/line-numbers"),
    }),

    // Configuración de la estrategia de ubicación
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },

    // Configuración de NgxSpinner
    importProvidersFrom(
      NgxSpinnerModule.forRoot({ type: "ball-scale-multiple" })
    ),

    // Configuración de Toastr
    importProvidersFrom(
      ToastrModule.forRoot({
        timeOut: 10000,
        positionClass: "toast-top-right",
        preventDuplicates: true,
      })
    ),

    // Configuración del Daterangepicker
    {
      provide: DATERANGEPICKER_CONFIG,
      useValue: daterangepickerConfig,
    },

    // Importación de NgxDaterangepickerMaterialModule
    importProvidersFrom(NgxDaterangepickerMd.forRoot()),

    // Agregar HttpClient con interceptores desde DI
    provideHttpClient(withInterceptorsFromDi()), // Aquí se usa provideHttpClient en lugar de HttpClientModule
  ],
};
