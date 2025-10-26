import { Status } from "uiTypes";
import { Userworkoutdayexercise } from "domain";

export interface UserWorkoutDayExerciseCollectionState {
    items?: Userworkoutdayexercise[]
    status: Status
    error?: string
}
