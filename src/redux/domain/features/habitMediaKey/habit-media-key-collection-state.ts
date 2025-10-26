import { Status } from "uiTypes";
import { Habitmediakey } from "domain";

export interface HabitMediaKeyCollectionState {
    items?: Habitmediakey[]
    status: Status
    error?: string
}
