import { Status } from "uiTypes";
import { Companyresource } from "domain";

export interface CompanyResourceCollectionState {
    items?: Companyresource[]
    status: Status
    error?: string
}
