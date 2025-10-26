import { Status } from "uiTypes";
import { Settings } from "domain";

export interface SettingsCollectionState {
    items?: Settings[]
    status: Status
    error?: string
}
