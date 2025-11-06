import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskServices } from '../../_services/task-services';
import { Task } from '../../_models/Task';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-task',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-task.html',
  styleUrl: './edit-task.css',
})
export class EditTask implements OnInit {
  @Input() taskId!: number;
  @Output() closeForm = new EventEmitter<boolean>();

  editForm!: FormGroup;
  loading = true;
  durationOptions: number[] = [15,20,30, 60, 90, 120, 180, 240];

  constructor(private fb: FormBuilder, private taskServices: TaskServices) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      duration: [60, Validators.required],
      laborCost: [0, [Validators.required, Validators.min(0)]],
      parts: this.fb.array([]),
    });

    this.loadTask();
  }

  get parts(): FormArray {
    return this.editForm.get('parts') as FormArray;
  }

  loadTask(): void {
    this.taskServices.getTaskById(this.taskId).subscribe({
      next: (task: Task) => {
        this.loading = false;
        this.editForm.patchValue({
          name: task.name,
          description: task.description,
          duration: task.duration,
          laborCost: task.laborCost,
        });

        this.parts.clear();
        task.parts?.forEach((part) => {
          this.parts.push(
            this.fb.group({
              name: [part.name, Validators.required],
              unitPrice: [part.unitPrice, [Validators.required, Validators.min(0)]],
              quantity: [part.quantity, [Validators.required, Validators.min(1)]],
            })
          );
        });
      },
      error: (err) => {
        console.error('Error loading task:', err);
        this.loading = false;
      },
    });
  }

  addPart(): void {
    this.parts.push(
      this.fb.group({
        name: ['', Validators.required],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
        quantity: [1, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removePart(index: number): void {
    this.parts.removeAt(index);
  }

  formatDuration(minutes: number): string {
    return minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`;
  }

  submit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const payload = {
      taskDTO: {
        name: this.editForm.value.name,
        description: this.editForm.value.description,
        duration: this.editForm.value.duration,
        laborCost: this.editForm.value.laborCost,
      },
      parts: this.editForm.value.parts,
    };

    Swal.fire({
      title: 'Are you sure edit?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, edit it!',
      theme: 'dark',
    }).then((result) => {
      if (result.isConfirmed) {
         this.taskServices.editRepairTask(this.taskId, payload).subscribe({
           next: () => {
             console.log('✅ Task updated successfully');
             this.closeForm.emit(true);
           },
           error: (err) => console.error('❌ Update failed:', err),
         });
      }
    });

  }

  cancel(): void {
    this.closeForm.emit(false);
  }
}
