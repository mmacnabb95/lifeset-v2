import { Status } from "uiTypes";
import { Workoutexerciseset } from "domain";

export interface WorkoutExerciseSetCollectionState {
    items?: Workoutexerciseset[]
    status: Status
    error?: string
}
