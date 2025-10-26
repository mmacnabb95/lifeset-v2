import { Status } from "uiTypes";
import { Userworkoutexerciseset } from "domain";

export interface UserWorkoutExerciseSetCollectionState {
    items?: Userworkoutexerciseset[]
    status: Status
    error?: string
}
