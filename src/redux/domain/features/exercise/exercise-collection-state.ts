import { Status } from "uiTypes";
import { Exercise } from "domain";

export interface ExerciseCollectionState {
    items?: Exercise[]
    status: Status
    error?: string
}
