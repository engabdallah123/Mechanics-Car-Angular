import { CommonModule } from '@angular/common';
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Part, Task } from '../../_models/Task';
import { TaskServices } from '../../_services/task-services';
import Swal from 'sweetalert2';
import { AddTask } from '../add-task/add-task';
import { SpinerComponent } from '../../Spiner/spiner-component/spiner-component';
import { LoadingServices } from '../../_services/loading-services';
import { EditTask } from '../edit-task/edit-task';


@Pipe({
  name: 'formatDuration',
  standalone: true
})
export class FormatDurationPipe implements PipeTransform {
  /**
   * Transforms a number of minutes into a "Xh Ym" format.
   * @param value The total number of minutes.
   * @returns A formatted string e.g., "1h 30m".
   */
  transform(value: number): string {
    if (value === null || value === undefined || value < 0) {
      return '0h 0m';
    }

    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    return `${hours}h ${minutes}m`;
  }
}

@Component({
  selector: 'app-repair-task-component',
  imports: [ CommonModule,FormsModule, AddTask, FormatDurationPipe, SpinerComponent, EditTask],
  templateUrl: './repair-task-component.html',
  styleUrl: './repair-task-component.css',
})
export class RepairTaskComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];

  showAddForm = false;

  showEditForm = false;
  selectedTaskId!: number;

  searchText: string = '';
  sortBy: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  activeMenuIndex: number | null = null;

  constructor(private taskServices: TaskServices, public loadingServices: LoadingServices) {}

  ngOnInit(): void {
    this.loadTasks();

    document.addEventListener('click', this.closeMenus.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeMenus.bind(this));
  }

  loadTasks(): void {
    this.loadingServices.show();
    this.taskServices.getAllTaskDetails().subscribe({
      next: (res) => {
        this.tasks = res;
        this.filteredTasks = [...res];
        console.log('✅ Tasks loaded:', res);
        this.loadingServices.hide();
      },
      error: (err) => {
        console.error('❌ Error fetching tasks:', err);
        this.loadingServices.hide();
      },
    });
  }

  openAddTask(): void {
    this.showAddForm = true;
  }

  closeAddTask(shouldReload: boolean): void {
    if (shouldReload) this.loadTasks();
    this.showAddForm = false;
  }

  editTask(task: Task): void {
     if (!task.taskId) return;
    this.selectedTaskId = task.taskId;
    this.showEditForm = true;
         this.activeMenuIndex = null;
  }
  closeEditTask(shouldReload: boolean): void {
    if (shouldReload) this.loadTasks();
    this.showEditForm = false;
  }

  applyFilters(): void {
    let result = this.tasks;

    if (this.searchText.trim() !== '') {
      const search = this.searchText.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(search) ||
          String(c.totalCost ?? '')
            .toLowerCase()
            .includes(search) ||
          String(c.duration ?? '')
            .toLowerCase()
            .includes(search)
      );
    }

    result = [...result].sort((a, b) => {
      let valA: string;
      let valB: string;

      switch (this.sortBy) {
        case 'total':
          valA = (a.totalCost ?? '').toString().toLowerCase();
          valB = (b.totalCost ?? '').toString().toLowerCase();
          break;
        case 'duration':
          valA = (a.duration ?? '').toString().toLowerCase();
          valB = (b.duration ?? '').toString().toLowerCase();
          break;
        default: // name
          valA = a.name?.toLowerCase() || '';
          valB = b.name?.toLowerCase() || '';
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredTasks = result;
  }

  setSortDirection(direction: 'asc' | 'desc') {
    this.sortDirection = direction;
    this.applyFilters();
  }

  deleteTask(taskId: number): void {
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
        this.taskServices.deleteTask(taskId).subscribe({
          next: () => {
            this.loadTasks();
          },
          error: (err) => {
            console.error('Delete failed:', err);
            alert('Failed to delete task');
          },
        });
      }
    });
  }

  toggleMenu(index: number) {
    this.activeMenuIndex = this.activeMenuIndex === index ? null : index;
  }
  closeMenus(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.btn-icon-only') && !target.closest('.dropdown-menu')) {
      this.activeMenuIndex = null;
    }
  }
  getTotalPartsCost(parts: Part[]): number {
    if (!parts || parts.length === 0) {
      return 0;
    }
    return parts.reduce((total, part) => total + part.quantity * part.unitPrice, 0);
  }

  // داخل parent component (اللي فيه <app-add-task>)
  onFormClosed(success: boolean) {
    if (success) {
      this.loadTasks(); // تعيد تحميل الداتا فقط بدون Reload للصفحة
    }
    this.showAddForm = false;
  }
}
