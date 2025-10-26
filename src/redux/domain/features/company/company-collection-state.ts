import { Status } from "uiTypes";
import { Company } from "domain";

export interface CompanyCollectionState {
    items?: Company[]
    status: Status
    error?: string
}
