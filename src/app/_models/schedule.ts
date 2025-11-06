import { WorkOrder } from "./workOrder";

export interface Slot {
  slotId: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  inPast: boolean;
  workOrderDTO?: WorkOrder;
  blockedDuration?: number; // هتحسبها بناءً على duration
  skipRender?: boolean;
}

export interface Station {
  name: string;
  code: string;
  stactionId: number;
  slots: Slot[];
}

export interface DaySchedule {
  date: string;
  stations: Station[];
}



