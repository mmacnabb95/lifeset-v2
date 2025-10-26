// Common UI Types for LifeSet V2

export type Status = "idle" | "pending" | "fulfilled" | "rejected";

export interface Credentials {
  email: string;
  password: string;
  show2fa?: boolean;
  code?: string;
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthState {
  status: Status;
  roles?: string[];
  user?: string;
  userId?: string;
  username?: string;
  two_factor_auth?: number;
  otp_required?: number;
  otp_token?: string;
  language?: string;
  pinAuthed?: boolean;
  hasPin?: boolean;
  firebaseUser?: FirebaseUser;
  error?: string;
}

// Add other common types as needed
export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
}

