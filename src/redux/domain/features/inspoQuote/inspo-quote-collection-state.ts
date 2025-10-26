import { Status } from "uiTypes";
import { Inspoquote } from "domain";

export interface InspoQuoteCollectionState {
    items?: Inspoquote[]
    status: Status
    error?: string
}
