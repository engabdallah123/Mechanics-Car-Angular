import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WorkOrder } from '../../_models/workOrder';
import { WorkOrderServices, WorkOrderStatus } from '../../_services/work-order-services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-state.html',
  styleUrls: ['./order-state.css'],
})
export class OrderState implements OnInit {
  @Input() orderId!: number;
  @Output() closeState = new EventEmitter<boolean>();

  workOrder: WorkOrder | null = null;
  currentState: string = 'Pending';
  steps: string[] = ['Pending', 'InProgress', 'Completed'];

  constructor(private workOrderService: WorkOrderServices, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.loadWorkOrder();
  }

  loadWorkOrder() {
    this.workOrderService.getOrderDetails(this.orderId).subscribe({
      next: (res) => {
        this.workOrder = res;

        const now = new Date();
        const startTime = new Date(res.startTime);
        const backendStatus = res.status;

        //  Sync frontend state with backend
        this.currentState = this.mapStatusToString(backendStatus);

        //  أربط currentStep بالحالة الجاية من السيرفر
        this.currentStep = this.steps.indexOf(this.currentState);

        //  Auto switch to InProgress if start time passed
        if (now > startTime && this.currentState === 'Pending') {
          this.currentState = 'InProgress';
          this.currentStep = this.steps.indexOf('InProgress');
          this.updateStatus(WorkOrderStatus.InProgress, false);
        }
      },
      error: (err) => console.error('❌ Error loading order', err),
    });
  }

  mapStatusToString(status: WorkOrderStatus | string): string {
    switch (status) {
      case WorkOrderStatus.Pending:
      case 'Pending':
        return 'Pending';
      case WorkOrderStatus.InProgress:
      case 'InProgress':
        return 'InProgress';
      case WorkOrderStatus.Completed:
      case 'Completed':
        return 'Completed';
      default:
        return 'Pending';
    }
  }

  updateStatus(newStatus: WorkOrderStatus, closeAfter: boolean = true) {
    if (!this.workOrder) return;

    this.workOrderService
      .updateState(this.workOrder.orderId, this.workOrder.tecnicianId, newStatus)
      .subscribe({
        next: (res) => {
            const Toast = Swal.mixin({
                      toast: true,
                      position: 'top-end',
                      showConfirmButton: false,
                      timer: 3000,
                      timerProgressBar: true,
                      didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                      },
                    });
                    Toast.fire({
                      icon: 'success',
                      title: 'State Updated successfully',
                    });
          console.log(`✅ Status updated to ${WorkOrderStatus[newStatus]}`);
          if (closeAfter) this.close(true);
        },
        error: (err) => console.error('❌ Error updating status', err),
      });
  }

  save() {
    if (!this.workOrder) return;

    if (this.currentState !== 'Completed') {
      console.warn('⚠️ Only completed status can be saved.');
      return;
    }

    this.updateStatus(WorkOrderStatus.Completed);
  }

  cancel() {
    this.close(false);
  }

  close(shouldReload: boolean) {
    this.closeState.emit(shouldReload);
  }

  setState(step: string): void {
    const stepIndex = this.steps.indexOf(step);
    if (stepIndex < this.currentStep) return;

    this.currentState = step;
    this.currentStep = stepIndex;
  }

  isStepActive(step: string): boolean {
    return step === this.currentState;
  }

  isStepCompleted(step: string): boolean {
    const currentIndex = this.steps.indexOf(this.currentState);
    const stepIndex = this.steps.indexOf(step);
    return stepIndex < currentIndex;
  }

  formatTime(time?: string | Date): string {
    if (!time) return '';

    if (typeof time === 'string') {
      // لو الوقت جاي زي "21:45:00" نركبه على تاريخ اليوم أو تاريخ الـ scheduled
      const baseDate = this.workOrder?.scheduled ? new Date(this.workOrder.scheduled) : new Date(); // fallback
      const [hours, minutes, seconds] = time.split(':').map(Number);
      baseDate.setHours(hours, minutes, seconds || 0, 0);
      return baseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // لو جاي Date بالفعل
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  currentStep = 0;
  goToStep(index: number) {
    if (index < this.currentStep) {
      return;
    }

    this.currentStep = index;
  }

  markComplete() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }
}
