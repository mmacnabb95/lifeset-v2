import { Status } from "uiTypes";
import { Fitnessgoal } from "domain";

export interface FitnessGoalCollectionState {
    items?: Fitnessgoal[]
    status: Status
    error?: string
}
