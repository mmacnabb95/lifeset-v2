import { Status } from "uiTypes";
import { Userhabitpack } from "domain";

export interface UserHabitPackCollectionState {
    items?: Userhabitpack[]
    status: Status
    error?: string
}
