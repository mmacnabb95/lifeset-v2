import { Status } from "uiTypes";
import { Reminder } from "domain";

export interface ReminderCollectionState {
    items?: Reminder[]
    status: Status
    error?: string
}
