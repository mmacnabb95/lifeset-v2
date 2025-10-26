import { Status } from "uiTypes";
import { Alltimestreak } from "domain";

export interface AllTimeStreakCollectionState {
    items?: Alltimestreak[]
    status: Status
    error?: string
}
