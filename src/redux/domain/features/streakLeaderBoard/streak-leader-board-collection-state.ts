import { Status } from "uiTypes";
import { Streakleaderboard } from "domain";

export interface StreakLeaderBoardCollectionState {
    items?: Streakleaderboard[]
    status: Status
    error?: string
}
