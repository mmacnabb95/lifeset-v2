import { Status } from "uiTypes";
import { Exerciseresource } from "domain";

export interface ExerciseResourceCollectionState {
    items?: Exerciseresource[]
    status: Status
    error?: string
}
