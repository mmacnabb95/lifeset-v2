import { Status } from "uiTypes";
import { Settype } from "domain";

export interface SetTypeCollectionState {
    items?: Settype[]
    status: Status
    error?: string
}
