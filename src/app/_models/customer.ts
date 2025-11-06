import { Make } from "./vehicle";

export interface YearModel {
  nameYear: string;
}
export interface VehicleModel {
  name: string;
  id: number;
  vehicleId: number;
  year: YearModel;
  make: Make;
}

export interface Vehicle {
  id: number;
  name: string;
  licensePlate: string;
  customerName: string;
  vehicleModel: VehicleModel;
}

export interface CustomerResponse {
  customerName: string;
  phoneNumber: string;
  email: string;
  customerId: number;
  vehicles: Vehicle[];
}
