import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Make, MakeModel } from '../_models/vehicle';

@Injectable({
  providedIn: 'root',
})
export class VehicleServices {
  private baseUrl = 'http://localhost:5299/api/Vehicle';
  private modelUrl = 'http://localhost:5299/api/VehicleModel/ModelsByMake/';

  constructor(private http: HttpClient) {}

  getAllVehicles() {
    return this.http.get<Make[]>(this.baseUrl);
  }
  getVehicleModels(id: number) {
    return this.http.get<MakeModel[]>(`${this.modelUrl}${id}`);
  }
  addVehicle(model:any) {
    return this.http.post('http://localhost:5299/api/Vehicle/AddVehicle', model);
  }
  deleteVehicle(id: number) {
    return this.http.delete(`http://localhost:5299/api/Vehicle/${id}`);
  }
}
