import { Routes } from "@angular/router";
import { certGuard } from "../../guard/cert.guard";
import { ReceivedCorrespondenceComponent } from "./pages/received-correspondence/received-correspondence.component";
import { ReceivedCorrespondenceEditComponent } from "./pages/received-correspondence-edit/received-correspondence-edit.component";
import { SentCorrespondenceEditComponent } from "./pages/sent-correspondence-edit/sent-correspondence-edit.component";
import { SentCorrespondenceComponent } from "./pages/sent-correspondence/sent-correspondence.component";
import { CorrespondenceDashboard } from "./pages/CorrespondenceDashboard/CorrespondenceDashboard";

export const correspondenceRoutes: Routes = [
  {
    path: "received",
    children: [
      {
        path: "",
        component: ReceivedCorrespondenceComponent,
        canActivate: [certGuard],
      },
      {
        path: "new",
        component: ReceivedCorrespondenceEditComponent,
        canActivate: [certGuard],
      },
      {
        path: "edit/:id",
        component: ReceivedCorrespondenceEditComponent,
        canActivate: [certGuard],
      },
    ],
  },

  {
    path: "CorrespondenceDashboard",
    component: CorrespondenceDashboard,
    data: { title: "CorrespondenceDashboard" },
  },

  {
    path: "sent",
    children: [
      {
        path: "",
        component: SentCorrespondenceComponent,
        canActivate: [certGuard],
      },
      {
        path: "new",
        component: SentCorrespondenceEditComponent,
        canActivate: [certGuard],
      },
      {
        path: "edit/:id",
        component: SentCorrespondenceEditComponent,
        canActivate: [certGuard],
      },
    ],
  },
];
