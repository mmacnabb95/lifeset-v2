import { Status } from "uiTypes";
import { Workout } from "domain";

export interface WorkoutCollectionState {
    items?: Workout[]
    status: Status
    error?: string
}
