import { Adminviewuser } from "../../../../types/domain/flat-types";

// eslint-disable-next-line no-shadow
export enum Roles {
  Admin = 1,
  Manager = 2,
  User = 3,
}

// eslint-disable-next-line no-shadow
export enum MediaKeys {
  Hero = 1,
  Icon = 2,
}

export type MediaKey = "Icon" | "Hero" | "Video" | "Logo";

export interface WithMediaResources {
  resources: {
    Key: MediaKey;
    Url: string;
  }[];
}

export interface WithTranslations {
  translations: any[];
}


export type SupportedLanguage = "English" | "Brazilian Portueguese";
// eslint-disable-next-line no-shadow
export enum SupportedLanguages {
  English = 1,
  Portuguese = 2,
}

export interface AdminviewuserWithRoles extends Adminviewuser {
  allRoles: { Id: number; Name: string }[];
}

export enum UserHabitPackStatus {
  Draft = 1,
  Published = 2,
  Rejected = 3,
}

export enum ClientEnvironement {
  REACT_APP_API_DOMAIN = 1,
  REACT_APP_IMAGEKIT_ENDPOINT = 2,
  REACT_APP_IMAGEKIT_PUBLIC_KEY = 3,
  REACT_APP_MEDIA_FOLDER = 4,
  REACT_APP_STRIPE_PUBLISHABLE_KEY = 5,
}
