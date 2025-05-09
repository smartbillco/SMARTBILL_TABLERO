import { Routes } from "@angular/router";
import { UserListComponent } from "./pages/user-list/user-list.component";
import { UserEditComponent } from "./pages/user-edit/user-edit.component";
import { certGuard } from "../../guard/cert.guard";

export const userManagementRoutes: Routes = [
  {
    path: "users",
    children: [
      {
        path: "",
        component: UserListComponent,
        canActivate: [certGuard],
      },
      {
        path: "new",
        component: UserEditComponent,
        canActivate: [certGuard],
      },
      {
        path: "edit/:id",
        component: UserEditComponent,
        canActivate: [certGuard],
      }
    ]
  }
];
