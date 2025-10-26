import { Status } from "uiTypes";
import { Habitpack } from "domain";

export interface HabitPackCollectionState {
    items?: Habitpack[]
    status: Status
    error?: string
}
