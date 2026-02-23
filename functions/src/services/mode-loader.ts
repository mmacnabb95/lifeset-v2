import { ModeConfig } from "../types/mode";

export const MODE_CONFIGS: Record<string, ModeConfig> = {
  consumer: {
    mode: "consumer",
    enabledFeatures: [
      "habits",
      "challenges",
      "journaling",
      "nutrition",
      "workouts",
      "streaks",
      "xp"
    ],
    navigation: [
      "Home",
      "Habits",
      "Journal",
      "Recipes",
      "Workouts",
      "Settings"
    ],
    contentPack: "consumerPack"
  },
  gym: {
    mode: "gym",
    enabledFeatures: [
      "bookings",
      "memberships",
      "packs",
      "qrCheckIn",
      "habits",
      "challenges",
      "analytics"
    ],
    navigation: [
      "Home",
      "Schedule",
      "Bookings",
      "Memberships",
      "Habits",
      "Challenges",
      "Analytics",
      "Settings"
    ],
    contentPack: "gymPack"
  },
  company: {
    mode: "company",
    enabledFeatures: [
      "habits",
      "challenges",
      "journaling",
      "analytics"
    ],
    navigation: [
      "Home",
      "Habits",
      "Challenges",
      "Journal",
      "Analytics",
      "Settings"
    ],
    contentPack: "corporatePack"
  },
  yoga: {
    mode: "yoga",
    enabledFeatures: [
      "bookings",
      "memberships",
      "packs",
      "qrCheckIn",
      "habits",
      "challenges",
      "analytics"
    ],
    navigation: [
      "Home",
      "Schedule",
      "Bookings",
      "Memberships",
      "Habits",
      "Challenges",
      "Settings"
    ],
    contentPack: "yogaPack"
  },
  pilates: {
    mode: "pilates",
    enabledFeatures: [
      "bookings",
      "memberships",
      "packs",
      "qrCheckIn",
      "habits",
      "challenges",
      "analytics"
    ],
    navigation: [
      "Home",
      "Schedule",
      "Bookings",
      "Memberships",
      "Habits",
      "Challenges",
      "Settings"
    ],
    contentPack: "pilatesPack"
  },
  hiit: {
    mode: "hiit",
    enabledFeatures: [
      "bookings",
      "memberships",
      "packs",
      "qrCheckIn",
      "habits",
      "challenges",
      "analytics"
    ],
    navigation: [
      "Home",
      "Schedule",
      "Bookings",
      "Memberships",
      "Habits",
      "Challenges",
      "Settings"
    ],
    contentPack: "hiitPack"
  },
  sauna: {
    mode: "sauna",
    enabledFeatures: [
      "bookings",
      "memberships",
      "packs",
      "qrCheckIn",
      "habits",
      "challenges",
      "analytics"
    ],
    navigation: [
      "Home",
      "Schedule",
      "Bookings",
      "Memberships",
      "Habits",
      "Challenges",
      "Settings"
    ],
    contentPack: "saunaPack"
  }
};

export function getModeConfig(organisationType: string): ModeConfig {
  return MODE_CONFIGS[organisationType] || MODE_CONFIGS.consumer;
}

