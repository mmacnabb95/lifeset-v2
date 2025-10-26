import { Status } from "uiTypes";
import { Cardioincluded } from "domain";

export interface CardioIncludedCollectionState {
    items?: Cardioincluded[]
    status: Status
    error?: string
}
