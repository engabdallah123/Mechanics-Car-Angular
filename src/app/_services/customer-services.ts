import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CustomerResponse } from '../_models/customer';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerServices {
  private baseUrl = 'http://localhost:5299/api/Customer/AllCustomerWithVecicle';

  constructor(private http: HttpClient) {}

  getCustomerDetails(): Observable<CustomerResponse[]> {
    return this.http.get<CustomerResponse[]>(this.baseUrl);
  }
  getCustomerById(id: number): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(
      `http://localhost:5299/api/Customer/CustomerWithVecicle/${id}`
    );
  }
  createCustomer(model: any) {
    return this.http.post('http://localhost:5299/api/Customer/AddCustomerWithVehicle', model);
  }
  deleteCustomer(id: number) {
    return this.http.delete(`http://localhost:5299/api/Customer/${id}`);
  }
  updateCustomer(id: number, model: any) {
    return this.http.put(`http://localhost:5299/api/Customer/${id}`, model);
  }
}
