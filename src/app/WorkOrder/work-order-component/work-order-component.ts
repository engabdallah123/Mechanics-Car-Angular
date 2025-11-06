import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { VehicleServices } from '../../_services/vehicle-services';
import { CustomerServices } from '../../_services/customer-services';
import { TaskServices } from '../../_services/task-services';
import { CustomerResponse } from '../../_models/customer';
import { Task } from '../../_models/Task';
import { WorkOrderServices } from '../../_services/work-order-services';
import Swal from 'sweetalert2';
import { AccountServices, Labor } from '../../_services/account-services';

@Component({
  selector: 'app-work-order-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './work-order-component.html',
  styleUrls: ['./work-order-component.css'],
})
export class WorkOrderComponent implements OnInit, OnChanges {
  @Input() slotId!: number;
  @Input() stactionId!: number;
  @Input() slot: any;
  @Input() station: any;

  @Output() closeForm = new EventEmitter<boolean>();

  selectedSlot: any = null;
  selectedStation: any = null;

  addOrderForm!: FormGroup;

  customers: CustomerResponse[] = [];
  selectedCustomer?: CustomerResponse;

  tasks: Task[] = [];

  labors: Labor[] = [];

  constructor(
    private fb: FormBuilder,
    private customerServices: CustomerServices,
    private taskServices: TaskServices,
    private workOrderServices: WorkOrderServices,
    private accountServices: AccountServices,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.addOrderForm = this.fb.group({
      vehicleId: [null, Validators.required],
      technicianId: ['', Validators.required],
      customerId: [null, Validators.required],
      slotId: [this.slotId, Validators.required],
      repairTasks: this.fb.array([]),
    });

    this.loadCustomers();
    this.loadTasks();
    this.loadLabors();

    this.addOrderForm.get('customerId')?.valueChanges.subscribe((id) => {
      this.selectedCustomer = this.customers.find((c) => c.customerId === +id);
    });
  }

  loadLabors() {
    this.accountServices.getAllLabors().subscribe({
      next: (res) => {
        this.labors = res;
      },
      error: (err) => {
        console.error('Error loading labors:', err);
      },
    });
  }
  loadCustomers() {
    this.customerServices.getCustomerDetails().subscribe({
      next: (res) => {
        this.customers = res;
      },
      error: (err) => {
        console.error('Error loading customers:', err);
      },
    });
  }

  loadTasks() {
    this.taskServices.getAllTaskDetails().subscribe({
      next: (res) => {
        this.tasks = res;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
      },
    });
  }

  get repairTasks(): FormArray {
    return this.addOrderForm.get('repairTasks') as FormArray;
  }

  addRepairTask(taskId: number) {
    if (!taskId) return;

    // لو الـ task مضافة قبل كده، تجاهلها
    const exists = this.repairTasks.value.some((t: any) => t.repairTaskId === taskId);
    if (exists) return;

    this.repairTasks.push(
      this.fb.group({
        repairTaskId: [taskId, Validators.required],
      })
    );
  }

  // Helper لعرض اسم الـ task في اللستة
  getTaskName(taskId: number): string {
    const task = this.tasks.find((t) => t.taskId === taskId);
    return task ? task.name : `Task #${taskId}`;
  }

  removeRepairTask(index: number) {
    this.repairTasks.removeAt(index);
  }

  save() {
    if (this.addOrderForm.valid) {
      const workOrder = this.addOrderForm.value;
      console.log('WorkOrder to send:', workOrder);
      this.workOrderServices.createWorkOrder(workOrder).subscribe({
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
            title: 'Order Created successfully',
          });

          console.log('Work order created successfully:', res);
          this.closeForm.emit(true);
        },
        error: (err) => {
          console.error('Error creating work order:', err);
        },
      });
    } else {
      this.addOrderForm.markAllAsTouched();
    }
  }

  cancel() {
    this.closeForm.emit(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['station'] && this.station) {
      // عشان لما يتغير الـ input نعمل refresh
      this.selectedStation = this.station?.name;
      this.cd.detectChanges();
    }
  }
  selectStation(name: string): void {
    this.selectedStation = name;
    this.cd.detectChanges();
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
        return '#000'; // أسود افتراضي
    }
  }

  formatTime(time?: string | Date): string {
    if (!time) return '';

    try {
      let date: Date;

      if (typeof time === 'string') {
        // لو الوقت بصيغة "HH:mm:ss" فقط
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const today = new Date();
        today.setHours(hours || 0, minutes || 0, seconds || 0, 0);
        date = today;
      } else {
        // لو الوقت Date
        date = time;
      }

      // تنسيق العرض (24 ساعة أو 12 ساعة حسب رغبتك)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', time, error);
      return '';
    }
  }
}
