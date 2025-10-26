import { Status } from "uiTypes";
import { Userhabitpackuse } from "domain";

export interface UserHabitPackUseCollectionState {
    items?: Userhabitpackuse[]
    status: Status
    error?: string
}
