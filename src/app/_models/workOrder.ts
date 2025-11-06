import { Vehicle } from "./customer";
import { InvoiceOrder } from "./invoice";
import { Task } from "./Task";

export interface WorkOrder {
  code: string;
  orderId: number;
  duration: number; // total duration of all tasks
  scheduled: Date; // ISO date string
  status: number | string;
  startTime: Date;
  endTime: Date;
  technicianName: string;
  tecnicianId: string;
  workStationName: string;
  grandTotal: number;
  invoice: InvoiceOrder;
  repairTasks: Task[];
  vehicle: Vehicle;
}
