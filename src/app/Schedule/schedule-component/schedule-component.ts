import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ScheduleServices } from '../../_services/schedule-services';
import { DaySchedule, Slot, Station } from '../../_models/schedule';
import { Subscription, interval } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { WorkOrderComponent } from '../../WorkOrder/work-order-component/work-order-component';
import { WorkOrderServices } from '../../_services/work-order-services';
import Swal from 'sweetalert2';
import { Router, RouterModule } from "@angular/router";
import { OrderState } from '../../WorkOrder/order-state/order-state';
import { WorkOrder } from '../../_models/workOrder';
import { ReassignLabor } from '../../WorkOrder/reassign-labor/reassign-labor';
import { AccountServices, Labor } from '../../_services/account-services';
import { ExtraTask } from '../../WorkOrder/extra-task/extra-task';
import { Task } from '../../_models/Task';
import { TaskServices } from '../../_services/task-services';

@Component({
  selector: 'app-schedule-component',
  standalone: true,
  imports: [
    FormsModule,
    WorkOrderComponent,
    RouterModule,
    OrderState,
    ReassignLabor,
    ExtraTask,
    CommonModule,
  ],
  providers: [DatePipe],
  templateUrl: './schedule-component.html',
  styleUrls: ['./schedule-component.css'],
})
export class ScheduleComponent implements OnInit, OnDestroy {
  scheduleDay: DaySchedule | null = null;
  date: Date = new Date();
  timeSubscription!: Subscription;
  currentTimeStr: string = '';

  showAddOrderForm = false;

  showStatusModal = false;
  selectedOrderId!: number;

  selectedSlotId!: number;
  selectedStationId!: number;
  clickedSlot!: Slot;
  clickedStation!: Station;

  showReassignModal = false;
  selectedWorkOrder!: WorkOrder;
  availableLabors: Labor[] = [];

  showAddTasksModal = false;
  availableTasks: Task[] = [];

  constructor(
    private scheduleService: ScheduleServices,
    private workOrderServices: WorkOrderServices,
    private router: Router,
    private accountServices: AccountServices,
    private taskServices: TaskServices
  ) {}

  ngOnInit(): void {
    this.loadTodaySchedule();
    this.trackCurrentTime();
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
  }
  loadTodaySchedule(): void {
    this.scheduleService.getTodayWithOrders(this.date).subscribe({
      next: (res) => {
        this.scheduleDay = res;
        this.date = new Date(res.date);

        const now = new Date();
        const scheduleDate = new Date(this.date);

        this.scheduleDay?.stations.forEach((station) => {
          for (const slot of station.slots) {
            slot.skipRender = false; // reset
            const [hours, minutes, seconds] = slot.startTime.split(':').map(Number);
            const slotStartTime = new Date(scheduleDate.getTime());
            slotStartTime.setHours(hours, minutes, seconds, 0);
            slot.inPast = slotStartTime < now;

            if (slot.workOrderDTO) {
              if (slot.inPast && slot.workOrderDTO.status === 0) {
                slot.workOrderDTO.status = 1;
              }
            }

            // 2. [FIX] استخدام 'for' loop عادية عشان 'continue' تشتغل
            for (let i = 0; i < station.slots.length; i++) {
              const slot = station.slots[i];

              if (slot.skipRender) {
                continue;
              }

              if (slot.workOrderDTO) {
                const totalTaskMinutes = slot.workOrderDTO.duration;
                const slotsToBlock = Math.ceil(totalTaskMinutes / 15);

                slot.blockedDuration = slotsToBlock;
                slot.isAvailable = false;

                for (let k = 1; k < slotsToBlock; k++) {
                  if (station.slots[i + k]) {
                    station.slots[i + k].skipRender = true;
                    station.slots[i + k].isAvailable = false;
                  }
                }
              } else {
                slot.blockedDuration = 1;
                slot.isAvailable = !slot.inPast;
              }
            }
          }
        });

        console.log('✅ Schedule with computed duration (Table Layout)', this.scheduleDay);
      },
      error: (err) => console.error('❌ Error loading schedule', err),
    });
  }

  /** تحديث الوقت كل دقيقة */
  trackCurrentTime() {
    this.updateTime();
    this.timeSubscription = interval(60000).subscribe(() => {
      this.updateTime();
      this.loadTodaySchedule(); // بنعمل load تاني عشان نحدث 'inPast'
    });
  }

  updateTime() {
    const now = new Date();
    this.currentTimeStr = now.toTimeString().substring(0, 5);
  }

  currentTime(): string {
    return this.currentTimeStr;
  }

  openAddWorkOrder(slot: Slot, station: Station) {
    if (!slot.isAvailable || slot.inPast) return;

    this.showAddOrderForm = true;
    this.clickedSlot = slot;
    this.clickedStation = station;
    this.selectedSlotId = slot.slotId;
    this.selectedStationId = station.stactionId;
  }

  closeAddWorkOrder(shouldReload: boolean, workOrder?: any): void {
    if (workOrder && !shouldReload) {
      const station = this.scheduleDay?.stations.find((s) => s.stactionId === workOrder.stationId);
      if (station) {
        const startIndex = station.slots.findIndex((slot) => slot.slotId === workOrder.slotId);
        if (startIndex === -1) return;

        const slotLengthMinutes = 15;
        const start = new Date(workOrder.startTime);
        const end = new Date(workOrder.endTime);
        const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        const slotsToBlock = Math.ceil(totalMinutes / slotLengthMinutes);

        for (let i = 0; i < slotsToBlock; i++) {
          if (station.slots[startIndex + i]) {
            station.slots[startIndex + i].isAvailable = false;
            if (i === 0) {
              station.slots[startIndex + i].blockedDuration = slotsToBlock;
              station.slots[startIndex + i].skipRender = false;
              station.slots[startIndex + i].workOrderDTO = workOrder;
            } else {
              station.slots[startIndex + i].blockedDuration = 1;
              station.slots[startIndex + i].skipRender = true;
            }
          }
        }
      }
    }

    if (shouldReload) {
      this.loadTodaySchedule();
    }

    this.showAddOrderForm = false;
  }
  deleteOrder(id?: number) {
    if (!id) return;
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      theme: 'dark',
    }).then((result) => {
      if (result.isConfirmed) {
        this.workOrderServices.deleteWorkOrder(id).subscribe({
          next: () => {
            console.log('Order Deleted Successfully');
            this.loadTodaySchedule();
          },
        });
      }
    });
  }
  orderDetails(workOrderId?: number) {
    this.router.navigate([`/details`, workOrderId]);
  }

  getStationColor(name: string): string {
    switch (name) {
      case 'A':
        return '#ff4d4d'; // أحمر
      case 'B':
        return '#4d79ff'; // أزرق
      case 'C':
        return '#4dff4d'; // أخضر
      case 'D':
        return '#ffa64d'; // برتقالي
      default:
        return '#e0e0e0'; // لون افتراضي
    }
  }
  openWorkOrderState(workOrder: WorkOrder) {
    this.selectedOrderId = workOrder.orderId;
    this.showStatusModal = true;
  }

  closeWorkOrderState(shouldReload: boolean): void {
    if (shouldReload) {
      this.loadTodaySchedule();
    }
    this.showStatusModal = false;
  }

  formatTime(time?: string | Date, baseDate?: string | Date): string {
    if (!time) return '';

    let dateObj: Date;

    try {
      if (typeof time === 'string') {
        // لو الوقت فيه 'T' → ISO كامل
        if (time.includes('T')) {
          dateObj = new Date(time);
        } else {
          // اجمع وقت HH:mm:ss مع تاريخ الجدول
          const base = baseDate ? new Date(baseDate) : new Date();
          const [hours, minutes, seconds] = time.split(':').map(Number);
          dateObj = new Date(
            base.getFullYear(),
            base.getMonth(),
            base.getDate(),
            hours,
            minutes,
            seconds || 0,
            0
          );
        }
      } else {
        dateObj = time;
      }

      const pipe = new DatePipe('en-US');
      return pipe.transform(dateObj, 'hh:mm a') ?? '';
    } catch (e) {
      console.error('Error formatting time:', e);
      return '';
    }
  }
  openReassignLabor(workOrder: WorkOrder) {
    console.log('✅ Modal should open for', workOrder);
    this.selectedWorkOrder = workOrder;
    this.showReassignModal = true;

    this.accountServices.getAllLabors().subscribe({
      next: (res) => (this.availableLabors = res),
      error: (err) => console.error('Error loading labors', err),
    });
  }
  onReassignLabor(newLaborId: string) {
    this.workOrderServices.reassignLabor(this.selectedWorkOrder.orderId, newLaborId).subscribe({
      next: () => {
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
          title: 'Labor changed successfully',
        });
        this.showReassignModal = false;
        this.loadTodaySchedule();
      },
      error: (err) => console.error('❌ Error reassigning labor', err),
    });
  }

  openAddTasksModal(order: WorkOrder) {
    console.log('Modal opened for work order:', order);
    this.selectedWorkOrder = order;
    this.showAddTasksModal = true;

    this.taskServices.getAllTaskDetails().subscribe({
      next: (res) => {
        console.log(`Availalble Tasks`, res);
        this.availableTasks = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  closeAddTasksModal() {
    this.showAddTasksModal = false;
  }

  onTasksAdded() {
    this.showAddTasksModal = false;
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
      title: 'Labor changed successfully',
    });

    this.loadTodaySchedule();
  }
}
