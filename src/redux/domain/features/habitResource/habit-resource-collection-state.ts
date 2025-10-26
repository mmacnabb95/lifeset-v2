import { Status } from "uiTypes";
import { Habitresource } from "domain";

export interface HabitResourceCollectionState {
    items?: Habitresource[]
    status: Status
    error?: string
}
