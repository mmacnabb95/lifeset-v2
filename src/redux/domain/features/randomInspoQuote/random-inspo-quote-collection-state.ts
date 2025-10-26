import { Status } from "uiTypes";
import { Randominspoquote } from "domain";

export interface RandomInspoQuoteCollectionState {
    items?: Randominspoquote[]
    status: Status
    error?: string
}
