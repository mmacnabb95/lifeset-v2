import { Status } from "uiTypes";
import { Language } from "domain";

export interface LanguageCollectionState {
    items?: Language[]
    status: Status
    error?: string
}
