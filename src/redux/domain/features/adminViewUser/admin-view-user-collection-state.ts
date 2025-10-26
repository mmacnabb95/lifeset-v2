import { Status } from "uiTypes";
import { Adminviewuser } from "domain";

export interface AdminViewUserCollectionState {
    items?: Adminviewuser[]
    status: Status
    error?: string
}
