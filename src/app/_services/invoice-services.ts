import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Invoice } from '../_models/invoice';

@Injectable({
  providedIn: 'root',
})
export class InvoiceServices {
  baseUrl = `http://localhost:5299/api/Invoice/`;
  constructor(private http: HttpClient) {}
  createInvoive(workOrderId: number) {
    return this.http.post(`${this.baseUrl}generate/${workOrderId}`, {});
  }
  getInvoice(invoiceId: number) {
    return this.http.get<Invoice>(`${this.baseUrl}${invoiceId}`);
  }
  settleInvoice(invoiceId: number) {
    return this.http.put(`${this.baseUrl}mark-paid/${invoiceId}`, {});
  }
  getPdfInvoice(invoiceId: number) {
    return this.http.get(`${this.baseUrl}pdf/${invoiceId}`, { responseType: 'blob' });
  }
}
