import { Status } from "uiTypes";
import { Userhabitpackstatus } from "domain";

export interface UserHabitPackStatusCollectionState {
    items?: Userhabitpackstatus[]
    status: Status
    error?: string
}
