import { Status } from "uiTypes";
import { Workoutsessionlength } from "domain";

export interface WorkoutSessionLengthCollectionState {
    items?: Workoutsessionlength[]
    status: Status
    error?: string
}
