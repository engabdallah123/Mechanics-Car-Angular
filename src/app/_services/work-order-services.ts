import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkOrder } from '../_models/workOrder';

export enum WorkOrderStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
}

@Injectable({
  providedIn: 'root',
})
export class WorkOrderServices {
  baseUrl = 'http://localhost:5299/api/WorkOrder';
  constructor(private http: HttpClient) {}

  createWorkOrder(workOrder: any) {
    return this.http.post(`${this.baseUrl}/create`, workOrder);
  }
  deleteWorkOrder(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  getOrderDetails(id: number) {
    return this.http.get<WorkOrder>(`${this.baseUrl}/${id}`);
  }
  updateState(orderId: number, technicianId: string, newStatus: number) {
    return this.http.put(
      `${this.baseUrl}/${orderId}/status?technicianId=${technicianId}&newStatus=${newStatus}`,
      {}
    );
  }
  reassignLabor(orderId: number, newTechnicianId: string) {
    return this.http.put(
      `${this.baseUrl}/${orderId}/technician?newTechnicianId=${newTechnicianId}`,
      {}
    );
  }

  getAllWorkOrders() {
    return this.http.get<WorkOrder>(`${this.baseUrl}`);
  }

  getWorkOrdersByDate(date:Date) {
    const formatted = date.toLocaleDateString('en-CA');
    return this.http.get<WorkOrder[]>(`${this.baseUrl}/${formatted}`);
  }
}
