import { Status } from "uiTypes";
import { Clientenvironment } from "domain";

export interface ClientEnvironmentCollectionState {
    items?: Clientenvironment[]
    status: Status
    error?: string
}
