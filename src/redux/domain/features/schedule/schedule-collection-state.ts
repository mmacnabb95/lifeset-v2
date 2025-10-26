import { Status } from "uiTypes";
import { Schedule } from "domain";

export interface ScheduleCollectionState {
    items?: Schedule[]
    status: Status
    error?: string
}
