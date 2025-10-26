import { Status } from "uiTypes";
import { Exercisemediakey } from "domain";

export interface ExerciseMediaKeyCollectionState {
    items?: Exercisemediakey[]
    status: Status
    error?: string
}
