import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskServices } from '../../_services/task-services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-task.html',
  styleUrls: ['./add-task.css'],
})
export class AddTask implements OnInit {
  @Output() closeForm = new EventEmitter<boolean>();

  repairTaskForm!: FormGroup;
  durationOptions: number[] = [20, 30, 45, 60, 90, 120, 180, 240, 300]; // Durations in minutes

  constructor(private fb: FormBuilder, private taskService: TaskServices) {
    this.repairTaskForm = this.fb.group({
      name: ['', Validators.required],
      laborCost: [null, [Validators.required, Validators.min(0)]],
      duration: [30, Validators.required], // default = 30 min
      parts: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.addPart();
  }

  /** Getter for parts array */
  get parts(): FormArray {
    return this.repairTaskForm.get('parts') as FormArray;
  }


  createPart(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }


  addPart(): void {
    this.parts.push(this.createPart());
  }


  removePart(index: number): void {
    this.parts.removeAt(index);
  }


  formatDuration(minutes: number): string {
    if (!minutes || minutes < 0) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }


  submit() {



    this.repairTaskForm.markAllAsTouched();

    if (this.repairTaskForm.invalid) {
      console.log('❌ Form is invalid');
      return;
    }

    const formValue = this.repairTaskForm.value;


   const payload = {
     taskDTO: {
       name: formValue.name,
       description: '',
       duration: formValue.duration,
       laborCost: formValue.laborCost,
     },
     parts: formValue.parts.map((p: any) => ({
       name: p.name,
       unitPrice: p.unitPrice,
       quantity: p.quantity,
     })),
   };


    console.log('📦 Sending payload:', payload);

    this.taskService.addRepairTask(payload).subscribe({
      next: () => {
        console.log('✅ Task added successfully');
        this.repairTaskForm.reset();
         this.parts.clear();
         
        this.closeForm.emit(true);

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
              title: 'Task added successfully',
            });

      },
      error: (err) => {
        console.error('❌ Error adding Task:', err);
      },
    });


    console.log('✅ Task added successfully');
    this.repairTaskForm.reset();
    this.parts.clear();
    this.closeForm.emit(true);
  }

  cancel() {
    this.closeForm.emit(false);
  }
}
