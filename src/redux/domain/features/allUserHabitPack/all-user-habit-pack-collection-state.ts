import { Status } from "uiTypes";
import { Alluserhabitpack } from "domain";

export interface AllUserHabitPackCollectionState {
    items?: Alluserhabitpack[]
    status: Status
    error?: string
}
