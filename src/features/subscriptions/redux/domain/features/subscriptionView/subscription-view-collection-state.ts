import { Status } from "uiTypes";
import { Subscriptionview } from "domain";

export interface SubscriptionViewCollectionState {
    items?: Subscriptionview[]
    status: Status
    error?: string
}
