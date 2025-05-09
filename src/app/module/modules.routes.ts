import { Routes } from "@angular/router";
import { PdfReaderComponent } from "./electronicBilling/common/pdf-reader/pdf-reader.component";
import { WelcomeComponent } from "./pages/welcome/welcome.component";
import { NetworkStatusComponent } from "./pages/network-status-component/network-status.component";
import { ExtraProfilePage } from "../pages/extra-profile/extra-profile";
import { ExtraSettingsPage } from "../pages/extra-settings-page/extra-settings-page";
import { Not403Component } from "./pages/not403/not403.component";
import { ErrorPage } from "./pages/not404/not404";
import { FileUploadComponent } from "./electronicBilling/common/file-upload/file-upload.component";

export const modulesRoutes: Routes = [
  { path: "welcome", component: WelcomeComponent },
  { path: "NetworkStatus", component: NetworkStatusComponent },

  {
    path: "user-management",
    loadChildren: () =>
      import("../module/user-management/user-management.routes").then(
        (m) => m.userManagementRoutes
      ),
  },
  {
    path: "electronicBilling",
    loadChildren: () =>
      import("../module/electronicBilling/electronicBilling.routes").then(
        (m) => m.electronicBillingRoutes
      ),
  },
  {
    path: "pos",
    loadChildren: () =>
      import("../module/pos/pos.routes").then((m) => m.posRoutes),
  },
  {
    path: "correspondence",
    loadChildren: () =>
      import("../module/correspondence/correspondence.routes").then(
        (m) => m.correspondenceRoutes
      ),
  },

  { path: "Settings", component: ExtraProfilePage },
  { path: "extraSettings", component: ExtraSettingsPage },

  { path: "ocr", component: PdfReaderComponent },
  { path: "archivo", component: FileUploadComponent },


  // Rutas de error
  { path: "not-403", component: Not403Component },
  { path: "**", component: ErrorPage, data: { title: "404 Error" } },
];
