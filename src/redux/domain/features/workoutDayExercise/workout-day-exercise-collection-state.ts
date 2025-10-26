import { Status } from "uiTypes";
import { Workoutdayexercise } from "domain";

export interface WorkoutDayExerciseCollectionState {
    items?: Workoutdayexercise[]
    status: Status
    error?: string
}
