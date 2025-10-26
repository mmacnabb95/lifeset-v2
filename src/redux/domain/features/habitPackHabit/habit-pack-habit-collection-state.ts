import { Status } from "uiTypes";
import { Habitpackhabit } from "domain";

export interface HabitPackHabitCollectionState {
    items?: Habitpackhabit[]
    status: Status
    error?: string
}
