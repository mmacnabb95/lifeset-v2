import { Status } from "uiTypes";
import { Myentriesjournal } from "domain";

export interface MyEntriesJournalCollectionState {
    items?: Myentriesjournal[]
    status: Status
    error?: string
}
