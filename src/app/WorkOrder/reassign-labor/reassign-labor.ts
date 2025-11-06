import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkOrder } from '../../_models/workOrder';
import { Labor } from '../../_services/account-services';
import { CommonModule } from '@angular/common';
import { WorkOrderServices } from '../../_services/work-order-services';

@Component({
  selector: 'app-reassign-labor',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './reassign-labor.html',
  styleUrl: './reassign-labor.css',
})
export class ReassignLabor implements OnInit {
  @Input() workOrder!: WorkOrder;
  @Input() labors: Labor[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmReassign = new EventEmitter<string>();

  selectedLabor?: Labor;

  constructor(private workOrderService: WorkOrderServices) {}

  ngOnInit() {
    if (this.workOrder && this.workOrder.tecnicianId) {
      this.selectedLabor = {
        laborId: this.workOrder.tecnicianId,
        laborName: this.workOrder.technicianName,
      };
    }
  }

  selectLabor(labor: any) {
    this.selectedLabor = { laborId: labor.laborId, laborName: labor.laborName };
  }

  save() {
    if (!this.selectedLabor) return;

    this.workOrderService
      .reassignLabor(this.workOrder.orderId, this.selectedLabor.laborId)
      .subscribe({
        next: () => {
          this.confirmReassign.emit(this.selectedLabor?.laborId);

          this.close();
        },
        error: (err) => {
          console.error('Error reassigning labor:', err);
        },
      });
  }

  close() {
    this.closeModal.emit();
  }

}
