import * as admin from "firebase-admin";

export interface Organisation {
  organisationId: string;
  type: "gym" | "yoga" | "pilates" | "hiit" | "sauna" | "company";
  name: string;
  logoUrl?: string;
  brandColours: {
    primary: string;
    secondary: string;
  };
  featureFlags: {
    bookings: boolean;
    memberships: boolean;
    packs: boolean;
    qrCheckIn: boolean;
    habits: boolean;
    challenges: boolean;
    journaling: boolean;
    nutrition: boolean;
    workouts: boolean;
    analytics: boolean;
  };
  contentPack: string; // "gymPack" | "yogaPack" | "pilatesPack" | "hiitPack" | "saunaPack" | "corporatePack"
  stripeAccountId?: string;
  goCardlessAccountId?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

export interface UserOrganisationLink {
  organisationId: string;
  role: "member" | "staff" | "admin" | "employee";
  joinedAt: admin.firestore.Timestamp;
}

export interface ExtendedUserProfile {
  uid: string;
  email: string;
  username: string;
  organisationId?: string | null;
  role?: "member" | "staff" | "admin" | "employee";
  mode?: string;
  [key: string]: any; // Allow other existing fields
}

