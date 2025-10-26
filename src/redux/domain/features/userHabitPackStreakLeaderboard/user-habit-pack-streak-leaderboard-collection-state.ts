import { Status } from "uiTypes";
import { Userhabitpackstreakleaderboard } from "domain";

export interface UserHabitPackStreakLeaderboardCollectionState {
    items?: Userhabitpackstreakleaderboard[]
    status: Status
    error?: string
}
