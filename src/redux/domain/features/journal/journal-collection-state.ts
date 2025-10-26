import { Status } from "uiTypes";
import { Journal } from "domain";

export interface JournalCollectionState {
    items?: Journal[]
    status: Status
    error?: string
}
