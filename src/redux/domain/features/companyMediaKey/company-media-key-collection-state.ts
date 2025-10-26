import { Status } from "uiTypes";
import { Companymediakey } from "domain";

export interface CompanyMediaKeyCollectionState {
    items?: Companymediakey[]
    status: Status
    error?: string
}
