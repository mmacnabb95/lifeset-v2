import { Status } from "uiTypes";
import { Workoutlocation } from "domain";

export interface WorkoutLocationCollectionState {
    items?: Workoutlocation[]
    status: Status
    error?: string
}
