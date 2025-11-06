import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkOrder } from '../../_models/workOrder';
import { WorkOrderServices } from '../../_services/work-order-services';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { InvoiceServices } from '../../_services/invoice-services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './work-order-list.html',
  styleUrls: ['./work-order-list.css'],
})
export class WorkOrderList implements OnInit, OnDestroy {
  workOrders: WorkOrder[] = [];
  filteredOrders: WorkOrder[] = [];
  subscription!: Subscription;

  searchText = '';
  statusFilter = '';
  fromDate: string = '';
  toDate: string = '';

  constructor(
    private workOrderServices: WorkOrderServices,
    private router: Router,
    private invoiceServices: InvoiceServices
  ) {}

  ngOnInit(): void {
    this.loadWorkOrders();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadWorkOrders() {
    this.subscription = this.workOrderServices.getAllWorkOrders().subscribe({
      next: (res: any) => {
        // handle either an array of WorkOrder or a single WorkOrder object
        const result: WorkOrder[] = Array.isArray(res) ? res : res ? [res] : [];
        this.workOrders = result;
        this.filteredOrders = [...this.workOrders]; // نسخة أولية
      },
      error: (err) => console.error(err),
    });
  }

  private normalizeStatusValue(val: any): string {
    if (val === null || val === undefined) return '';

    const enumMap: Record<number, string> = {
      0: 'pending',
      1: 'inprogress',
      2: 'completed',
    };

    if (typeof val === 'number') {
      return (enumMap[val] || '').toLowerCase();
    }

    return String(val).trim().toLowerCase();
  }

  applyFilters() {
    const search = this.searchText?.trim().toLowerCase() || '';
    const statusFilter = (this.statusFilter || '').trim().toLowerCase();

    this.filteredOrders = this.workOrders.filter((order) => {
      // search on customer, make, plate, technician
      const vehicleMake = order?.vehicle?.vehicleModel?.make?.makeName || '';
      const vehicleName = order?.vehicle?.vehicleModel?.name || '';
      const license = order?.vehicle?.licensePlate || '';
      const customer = order?.vehicle?.customerName || '';
      const technician = order?.technicianName || '';

      const combinedSearch =
        `${vehicleMake} ${vehicleName} ${license} ${customer} ${technician}`.toLowerCase();

      const matchesSearch = !search || combinedSearch.includes(search);

      // normalize order.status
      const orderStatusNormalized = this.normalizeStatusValue(order?.status);

      const matchesStatus = !statusFilter || orderStatusNormalized === statusFilter;

      // date filter (same as قبل)
      const orderDate = order?.scheduled ? new Date(order.scheduled) : null;
      const matchesFrom = !this.fromDate || (orderDate && orderDate >= new Date(this.fromDate));
      const matchesTo = !this.toDate || (orderDate && orderDate <= new Date(this.toDate));

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }

  resetFilters() {
    this.searchText = '';
    this.statusFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.filteredOrders = [...this.workOrders];
  }

  orderDetails(workOrderId?: number) {
    this.router.navigate([`/details`, workOrderId]);
  }
  createInvoice(workOrderId: number) {
    this.invoiceServices.createInvoive(workOrderId).subscribe({
      next: () => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: 'success',
          title: 'Invoice created successfully',
        });
      },
    });
    this.loadWorkOrders();
  }
  showInvoice(invoiceId?: number) {
    this.router.navigate([`/invoice`, invoiceId]);
  }

  formatTime(time?: string | Date): string {
    if (!time) return '';
    let date: Date;
    if (typeof time === 'string') {
      const parts = time.split(':').map(Number);
      date = new Date();
      date.setHours(parts[0], parts[1], parts[2] || 0, 0);
    } else {
      date = time;
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  getTaskClass(taskName: string): string {
    const normalized = taskName.toLowerCase();
    if (normalized.includes('engine oil')) return 'pill-oil';
    if (normalized.includes('tire')) return 'pill-tire';
    if (normalized.includes('alignment')) return 'pill-align';
    if (normalized.includes('spark')) return 'pill-spark';
    if (normalized.includes('diagnostic')) return 'pill-diagnostic';
    if (normalized.includes('air')) return 'pill-ac';
    if (normalized.includes('transmission')) return 'pill-trans';
    if (normalized.includes('battery')) return 'pill-battery';
    if (normalized.includes('brake')) return 'pill-brake';
    if (normalized.includes('timing')) return 'pill-timing';
    return 'pill-default';
  }
}
