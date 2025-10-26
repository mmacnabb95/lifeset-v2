import { Status } from "uiTypes";
import { Benefit } from "domain";

export interface BenefitCollectionState {
    items?: Benefit[]
    status: Status
    error?: string
}
