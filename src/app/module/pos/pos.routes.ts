import { Routes } from "@angular/router";
import { certGuard } from "../../guard/cert.guard";
import { ProductComponent } from "./pages/product/product.component";
import { SalesComponent } from "./pages/sales/sales.component";
import { SupplierComponent } from "./pages/supplier/supplier.component";
import { CategoryComponent } from "./pages/category/category.component";
import { ReportComponent } from "../electronicBilling/common/report/report.component";
import { CustomerEditComponent } from "./pages/customer/customer-edit/customer-edit.component";
import { CustomerComponent } from "./pages/customer/customer.component";

export const posRoutes: Routes = [
  { path: "category", component: CategoryComponent, canActivate: [certGuard] },
  {
    path: "customer",
    component: CustomerComponent,
    children: [
      { path: "new", component: CustomerEditComponent },
      { path: "edit/:id", component: CustomerEditComponent },
    ],
    canActivate: [certGuard],
  },
  { path: "product", component: ProductComponent, canActivate: [certGuard] },
  { path: "sales", component: SalesComponent, canActivate: [certGuard] },
  { path: "supplier", component: SupplierComponent, canActivate: [certGuard] },
  { path: "report", component: ReportComponent, canActivate: [certGuard] },
];
