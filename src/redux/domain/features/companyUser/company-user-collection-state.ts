import { Status } from "uiTypes";
import { Companyuser } from "domain";

export interface CompanyUserCollectionState {
    items?: Companyuser[]
    status: Status
    error?: string
}
