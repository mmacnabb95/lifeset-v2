import { Status } from "uiTypes";
import { Workoutday } from "domain";

export interface WorkoutDayCollectionState {
    items?: Workoutday[]
    status: Status
    error?: string
}
