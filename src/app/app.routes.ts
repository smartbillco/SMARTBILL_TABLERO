import { Routes } from "@angular/router";
import { LayoutComponent } from "./components/layout/layout.component";
import { LandingPagesComponent } from "./pages/landing/landing-pages.component";
import { LoginComponent } from "./pages/login/login";
import { RegisterComponent } from "./pages/login/register/register";
import { ForgotComponent } from "./pages/login/forgot/forgot.component";
import { RandomComponent } from "./pages/login/forgot/random/random.component";
import { ErrorPage } from "./module/pages/not404/not404";

export const routes: Routes = [
  { path: "", redirectTo: "/landingPages", pathMatch: "full" },
  {
    path: "landingPages",
    component: LandingPagesComponent,
    data: { title: "LandingPages" },
  },
  { path: "login", component: LoginComponent },

  { path: "register", component: RegisterComponent },
  {
    path: "forgot",
    component: ForgotComponent,
  },
  {
    path: "forgot/:random",
    component: RandomComponent,
  },
  {
    path: "module",
    component: LayoutComponent,
    loadChildren: () =>
      import("./module/modules.routes").then((x) => x.modulesRoutes),
  },


  { path: "**", component: ErrorPage },
];