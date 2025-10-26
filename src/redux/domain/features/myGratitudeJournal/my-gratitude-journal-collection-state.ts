import { Status } from "uiTypes";
import { Mygratitudejournal } from "domain";

export interface MyGratitudeJournalCollectionState {
    items?: Mygratitudejournal[]
    status: Status
    error?: string
}
