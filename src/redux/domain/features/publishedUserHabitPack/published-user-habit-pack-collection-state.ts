import { Status } from "uiTypes";
import { Publisheduserhabitpack } from "domain";

export interface PublishedUserHabitPackCollectionState {
    items?: Publisheduserhabitpack[]
    status: Status
    error?: string
}
