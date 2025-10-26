import { Status } from "uiTypes";
import { Currentfitnesslevel } from "domain";

export interface CurrentFitnessLevelCollectionState {
    items?: Currentfitnesslevel[]
    status: Status
    error?: string
}
