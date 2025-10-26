import { Status } from "uiTypes";
import { Relaxlistjournal } from "domain";

export interface RelaxListJournalCollectionState {
    items?: Relaxlistjournal[]
    status: Status
    error?: string
}
