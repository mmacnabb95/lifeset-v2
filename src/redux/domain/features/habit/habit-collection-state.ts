import { Status } from "uiTypes";
import { Habit } from "domain";

export interface HabitCollectionState {
    items?: Habit[]
    status: Status
    error?: string
}
