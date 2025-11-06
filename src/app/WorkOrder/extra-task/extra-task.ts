import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { WorkOrder } from '../../_models/workOrder';
import { Task } from '../../_models/Task';
import { TaskServices } from '../../_services/task-services';
import { CommonModule } from '@angular/common';
import { FormatDurationPipe } from '../../Repair-Task/repair-task-component/repair-task-component';

@Component({
  selector: 'app-extra-task',
  standalone: true,
  imports: [CommonModule, FormatDurationPipe],
  templateUrl: './extra-task.html',
  styleUrl: './extra-task.css',
})
export class ExtraTask implements OnChanges {
  @Input() workOrder!: WorkOrder;
  @Input() tasks: Task[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() tasksAdded = new EventEmitter<void>();

  selectedTaskIds: number[] = [];

  constructor(private taskService: TaskServices) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.workOrder && this.tasks?.length) {
      const existingNames = this.workOrder.repairTasks?.map((t) => t.name.toLowerCase()) || [];
      this.selectedTaskIds = this.tasks
        .filter((t) => existingNames.includes(t.name.toLowerCase()))
        .map((t) => t.taskId);
    }
  }

  toggleTaskSelection(taskId: number) {
    if (this.selectedTaskIds.includes(taskId)) {
      this.selectedTaskIds = this.selectedTaskIds.filter((id) => id !== taskId);
    } else {
      this.selectedTaskIds.push(taskId);
    }
  }

  save() {
    if (!this.selectedTaskIds.length) return;

    this.taskService.addTasksToWorkOrder(this.workOrder.orderId, this.selectedTaskIds).subscribe({
      next: () => {
        this.tasksAdded.emit();
        this.closeModal.emit();
      },
      error: (err) => console.error('Error adding tasks:', err),
    });
  }

  close() {
    this.closeModal.emit();
  }
}
