import { Status } from "uiTypes";
import { Checkinjournal } from "domain";

export interface CheckInJournalCollectionState {
    items?: Checkinjournal[]
    status: Status
    error?: string
}
