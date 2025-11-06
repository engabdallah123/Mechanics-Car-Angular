import { Component, OnDestroy, OnInit } from '@angular/core';
import { Invoice } from '../../_models/invoice';
import { ActivatedRoute } from '@angular/router';
import { InvoiceServices } from '../../_services/invoice-services';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-invoice-component',
  imports: [CommonModule, DatePipe],
  templateUrl: './invoice-component.html',
  styleUrl: './invoice-component.css',
})
export class InvoiceComponent implements OnInit, OnDestroy {
  sub?: Subscription;
  invoice!: Invoice;
  constructor(private activatedRouter: ActivatedRoute, private invoiceService: InvoiceServices) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngOnInit(): void {
    this.sub = this.activatedRouter.params.subscribe((data) => {
      this.loadInvoice(data[`invoiceId`]);
    });
  }

  loadInvoice(id: number) {
    this.invoiceService.getInvoice(id).subscribe({
      next: (res) => {
        this.invoice = res;

        // احسب totalCost لكل task بعد ما توصلك البيانات
        this.invoice.tasks.forEach((task) => {
          const partsTotal =
            task.parts?.reduce((sum: number, p: any) => sum + p.unitPrice * p.quantity, 0) || 0;
          task.totalCost = task.laborCost + partsTotal;
        });
      },
      error: (err) => console.error('Error loading invoice', err),
    });
  }

  settleInvoice() {
    this.invoiceService.settleInvoice(this.invoice.id).subscribe({
      next: () => {
        this.invoice.isPaid = true;
        this.loadInvoice(this.invoice.id);
      },
      error: (err) => console.error('Error settling invoice', err),
    });
  }

  downloadPDF(invoiceId: number) {
    this.invoiceService.getPdfInvoice(invoiceId).subscribe({
      next: (res: Blob) => {
        const fileURL = window.URL.createObjectURL(res);
        window.open(fileURL, '_blank'); 
      },
      error: (err) => {
        console.error('Error opening PDF:', err);
      },
    });
  }
}
