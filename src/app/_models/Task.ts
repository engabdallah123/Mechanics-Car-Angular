export interface Task {
  name: string;
  taskId: number;
  description: string;
  duration: number;
  laborCost: number;
  totalCost: number;
  parts: Part[];
}
export interface Part {
  name: string;
  unitPrice: number;
  quantity: number;
}