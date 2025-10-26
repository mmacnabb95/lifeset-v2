import { Status } from "uiTypes";
import { Habitpackhabitschedule } from "domain";

export interface HabitPackHabitScheduleCollectionState {
    items?: Habitpackhabitschedule[]
    status: Status
    error?: string
}
