import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WorkOrderServices } from '../../_services/work-order-services';
import { WorkOrder } from '../../_models/workOrder';
import { CommonModule, DatePipe } from '@angular/common';
import { FormatDurationPipe } from '../../Repair-Task/repair-task-component/repair-task-component';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule, DatePipe, FormatDurationPipe],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails implements OnInit, OnDestroy {
  constructor(
    public activatedRouter: ActivatedRoute,
    public workOrderServices: WorkOrderServices
  ) {}
  sub?: Subscription;
  workOrder: WorkOrder | null = null;
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  ngOnInit(): void {
    this.sub = this.activatedRouter.params.subscribe((data) => {
      this.workOrderServices.getOrderDetails(data[`orderId`]).subscribe((res) => {
        console.log(res);
        this.workOrder = res;
      });
    });
  }
}

