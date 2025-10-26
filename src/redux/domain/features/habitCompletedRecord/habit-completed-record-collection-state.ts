import { Status } from "uiTypes";
import { Habitcompletedrecord } from "domain";

export interface HabitCompletedRecordCollectionState {
    items?: Habitcompletedrecord[]
    status: Status
    error?: string
}
