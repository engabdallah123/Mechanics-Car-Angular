import { Component, OnInit } from '@angular/core';
import { WorkOrder } from '../../_models/workOrder';
import { WorkOrderServices } from '../../_services/work-order-services';
import { DatePipe, DecimalPipe } from '@angular/common';

export enum WorkOrderStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
}

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css'],
})
export class DashboardComponent implements OnInit {
  workOrders: WorkOrder[] = [];
  date: Date = new Date();

  // 📊 القيم الخاصة بالإحصائيات
  totalOrders: number = 0;
  pendingOrders: number = 0;
  inProgressOrders: number = 0;
  completedOrders: number = 0;
  cancelledOrders: number = 0;

  totalRevenue: number = 0;
  totalPartsCost: number = 0;
  totalLaborCost: number = 0;
  netProfit: number = 0;

  totalVehicles: number = 0;
  totalCustomers: number = 0;
  profitMargin: number = 0;

  completionRate: number = 0;
  avgRevenuePerOrder: number = 0;
  ordersPerVehicle: number = 0;

  partsCostRatio: number = 0;
  laborCostRatio: number = 0;
  cancellationRate: number = 0;

  constructor(private workOrderServices: WorkOrderServices) {}

  ngOnInit(): void {
    this.loadWorkOrders();
  }

  loadWorkOrders() {

    this.workOrderServices.getWorkOrdersByDate(this.date).subscribe({
      next: (res) => {
        this.workOrders = Array.isArray(res) ? res : res ? [res] : [];
        this.calculateStats();
      },
      error: (err) => {
        console.error('Error fetching work orders:', err);
      },
    });
  }

  calculateStats() {
    this.totalOrders = this.workOrders.length;
    // نحول الـ status النصي إلى رقم مطابق للـ enum
    this.workOrders.forEach((order) => {
      if (typeof order.status === 'string') {
        switch (order.status.toLowerCase()) {
          case 'pending':
            order.status = WorkOrderStatus.Pending;
            break;
          case 'inprogress':
          case 'in_progress':
            order.status = WorkOrderStatus.InProgress;
            break;
          case 'completed':
            order.status = WorkOrderStatus.Completed;
            break;
        }
      }
    });
    this.pendingOrders = this.workOrders.filter((x) => x.status === WorkOrderStatus.Pending).length;

    this.inProgressOrders = this.workOrders.filter(
      (x) => x.status === WorkOrderStatus.InProgress
    ).length;

    this.completedOrders = this.workOrders.filter(
      (x) => x.status === WorkOrderStatus.Completed
    ).length;


    // 💰 الحسابات المالية
    this.totalRevenue = this.workOrders.reduce((sum, x) => sum + (x.grandTotal || 0), 0);

    // تكلفة القطع (داخل كل task)
    this.totalPartsCost = this.workOrders.reduce((sum, order) => {
      const taskPartsTotal = (order.repairTasks || []).reduce(
        (taskSum, task) => taskSum + (task.totalCost || 0),
        0
      );
      return sum + taskPartsTotal;
    }, 0);

    // تكلفة العمالة
    this.totalLaborCost = this.workOrders.reduce((sum, order) => {
      const taskLaborTotal = (order.repairTasks || []).reduce(
        (taskSum, task) => taskSum + (task.laborCost || 0),
        0
      );
      return sum + taskLaborTotal;
    }, 0);

    // صافي الربح
    this.netProfit = this.totalRevenue - this.totalPartsCost - this.totalLaborCost;

    // النسب
    this.profitMargin = this.totalRevenue > 0 ? (this.netProfit / this.totalRevenue) * 100 : 0;

    this.partsCostRatio =
      this.totalRevenue > 0 ? (this.totalPartsCost / this.totalRevenue) * 100 : 0;

    this.laborCostRatio =
      this.totalRevenue > 0 ? (this.totalLaborCost / this.totalRevenue) * 100 : 0;

    this.cancellationRate =
      this.totalOrders > 0 ? (this.cancelledOrders / this.totalOrders) * 100 : 0;

    this.completionRate =
      this.totalOrders > 0 ? (this.completedOrders / this.totalOrders) * 100 : 0;

    this.avgRevenuePerOrder = this.totalOrders > 0 ? this.totalRevenue / this.totalOrders : 0;

    // 🚗 العملاء والعربيات
    const vehicles = new Set(
      this.workOrders.map((x) => x.vehicle?.licensePlate).filter((x) => x != null)
    );
    const customers = new Set(
      this.workOrders.map((x) => x.technicianName).filter((x) => x != null)
    );

    this.totalVehicles = vehicles.size;
    this.totalCustomers = customers.size;

    this.ordersPerVehicle = this.totalVehicles > 0 ? this.totalOrders / this.totalVehicles : 0;
  }

  onDateChange(newDate: Date) {
    this.date = newDate;
    this.loadWorkOrders();
  }
}
