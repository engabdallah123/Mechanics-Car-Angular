import { Task } from "./Task";

export interface Invoice {
  id: number;
  invoiceNumber: string;
  dateIssued: Date;
  isPaid: boolean;
  subtotal: number;
  discount: number;
  total: number;
  customerName: string;
  tax: number;
  tasks: Task[];
  vehicleName: string;
  licencePlate:string;
}

export interface InvoiceOrder {
  invoiceId: number;
  isPaid:boolean;
}
