import { Status } from "uiTypes";
import { Publishedworkout } from "domain";

export interface PublishedWorkoutCollectionState {
    items?: Publishedworkout[]
    status: Status
    error?: string
}
