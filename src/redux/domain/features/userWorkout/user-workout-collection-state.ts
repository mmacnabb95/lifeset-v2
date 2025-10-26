import { Status } from "uiTypes";
import { Userworkout } from "domain";

export interface UserWorkoutCollectionState {
    items?: Userworkout[]
    status: Status
    error?: string
}
