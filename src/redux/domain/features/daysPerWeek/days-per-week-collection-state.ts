import { Status } from "uiTypes";
import { Daysperweek } from "domain";

export interface DaysPerWeekCollectionState {
    items?: Daysperweek[]
    status: Status
    error?: string
}
