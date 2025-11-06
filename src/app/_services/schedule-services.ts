import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DaySchedule } from '../_models/schedule';
import { tick } from '@angular/core/testing';

@Injectable({
  providedIn: 'root',
})
export class ScheduleServices {
  private baseUrl: string = 'http://localhost:5299/api/Schedule/';
  constructor(private http: HttpClient) {}

  getTodaySchedule(): Observable<DaySchedule> {
    return this.http.get<DaySchedule>(`${this.baseUrl}today`);
  }
  getTodayWithOrders(date: Date): Observable<DaySchedule> {
    const formatted = date.toLocaleDateString('en-CA');

    return this.http.get<DaySchedule>(`${this.baseUrl}todayWithOrder?date=${formatted}`);
  }
}
