import { Status } from "uiTypes";
import { Explorefeature } from "domain";

export interface ExploreFeatureCollectionState {
    items?: Explorefeature[]
    status: Status
    error?: string
}
