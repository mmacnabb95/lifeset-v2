import { Status } from "uiTypes";
import { Category } from "domain";

export interface CategoryCollectionState {
    items?: Category[]
    status: Status
    error?: string
}
