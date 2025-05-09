import { Routes } from "@angular/router";
import { certGuard } from "../../guard/cert.guard";
import { PersonJuridicalDashboardComponent } from "./pages/person-juridical-dashboard/person-juridical-dashboard.component";
import { PersonNaturalDashboardComponent } from "./pages/person-natural-dashboard/person-natural-dashboard.component";
import { TextExtractComponent } from "./pages/text-extract/text-extract.component";

export const electronicBillingRoutes: Routes = [
  { path: "", redirectTo: "person-natural", pathMatch: "full" }, 
  { path: "person-natural", component: PersonNaturalDashboardComponent,  },
  { path: "person-legal"  , component: PersonJuridicalDashboardComponent, canActivate: [certGuard] },

  { path: 'extraeTexto', component: TextExtractComponent, data: { title: 'CorrespondenceDashboard' } },
  
];
