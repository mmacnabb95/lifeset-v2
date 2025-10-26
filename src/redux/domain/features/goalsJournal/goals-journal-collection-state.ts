import { Status } from "uiTypes";
import { Goalsjournal } from "domain";

export interface GoalsJournalCollectionState {
    items?: Goalsjournal[]
    status: Status
    error?: string
}
