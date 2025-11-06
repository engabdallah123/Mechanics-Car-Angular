import { Routes } from '@angular/router';
import { HomeComponent } from './Home/home-component/home-component';
import { NotFoundComponent } from './NOT-Found/not-found-component/not-found-component';
import { LoginComponent } from './Login/login-component/login-component';
import { CustomerComponent } from './Customer/customer-component/customer-component';
import { RepairTaskComponent } from './Repair-Task/repair-task-component/repair-task-component';
import { OrderDetails } from './WorkOrder/order-details/order-details';
import { WorkOrderList } from './WorkOrder/work-order-list/work-order-list';
import { InvoiceComponent } from './Invoice/invoice-component/invoice-component';
import { DashboardComponent } from './Dashboard/dashboard-component/dashboard-component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent, title: 'Home' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'customer', component: CustomerComponent, title: 'customer' },
  { path: `task`, component: RepairTaskComponent, title: 'Repair Tasks' },
  {
    path: 'schedule',
    loadChildren: () =>
      import('./Schedule/schedule-component/schedule.routes').then((m) => m.ScheduleModule),
  },
  { path: `details/:orderId`, component: OrderDetails, title: 'Order Details' },
  { path: `orders`, component: WorkOrderList, title: `Order List` },
  { path: `invoice/:invoiceId`, component: InvoiceComponent, title: `Invoice` },
  {path:`dashboard`,component:DashboardComponent,title:`Dashboard`},
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent, title: 'Not Found' },
];
