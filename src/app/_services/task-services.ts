import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Task } from '../_models/Task';

@Injectable({
  providedIn: 'root',
})
export class TaskServices {
  private baseUrl = `http://localhost:5299/api/RepairTask`;

  constructor(private http: HttpClient) {}

  getAllTaskDetails() {
    return this.http.get<Task[]>(`${this.baseUrl}`);
  }
  deleteTask(taskId: number) {
    return this.http.delete(`${this.baseUrl}/${taskId}`);
  }
  addRepairTask(model: any) {
    return this.http.post<Task>(`${this.baseUrl}`, model);
  }
  editRepairTask(taskId: number, model: any) {
    return this.http.put<Task>(`${this.baseUrl}/${taskId}`, model);
  }
  getTaskById(taskId: number) {
    return this.http.get<Task>(`${this.baseUrl}/${taskId}`);
  }
  addTasksToWorkOrder(workOrderId: number, repairTaskIds: number[]) {
    const body = { workOrderId, repairTaskIds };
    return this.http.post(`http://localhost:5299/add-tasks`, body);
  }
}
