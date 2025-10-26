import { Status } from "uiTypes";
import { Todolistjournal } from "domain";

export interface TodoListJournalCollectionState {
    items?: Todolistjournal[]
    status: Status
    error?: string
}
