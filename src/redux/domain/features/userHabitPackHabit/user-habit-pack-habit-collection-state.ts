import { Status } from "uiTypes";
import { Userhabitpackhabit } from "domain";

export interface UserHabitPackHabitCollectionState {
    items?: Userhabitpackhabit[]
    status: Status
    error?: string
}
