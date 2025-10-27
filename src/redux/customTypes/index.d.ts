declare module "uiTypes" {
  export interface Item {
    id: number;
    title: string;
    description: string;
    imageSrc?: string;
    locationId?: number;
    location?: string;
    slug?: string;
    // eslint-disable-next-line no-undef
    file?: File;
  }

  interface UploadedFileInterface {
    id: number;
    locationId: number;
    location: string;
    userId: number;
    fileType: string;
    size: number;
    slug: string;
    DateTime: string;
  }

  export interface UploadFileState {
    status: Status;
    uploadedFiles: UploadedFileInterface[] | undefined;
    uploadedFile: UploadedFileInterface | undefined;
    error: string | undefined;
    Deleted: {} | undefined;
  }

  export interface SerializedError {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
  }

  export interface NotificationsState {
    status: Status;
    notifications: Notifications[];
    badge: number;
  }

  export interface Notifications {
    id?: number | undefined;
    sender: string;
    title?: string | undefined;
    description: string;
    link: string;
    action: string;
    dismiss?: boolean;
  }

  export interface Credentials {
    show2fa?: boolean;
    email?: string;
    password: string;
    // username: string;
    code: string;
  }

  export interface User {
    id: number | undefined;
    public_username: string;
    bio?: string;
    imageSrc: string;
    position: boolean;
    roles?: { Id: string; Name: string }[];
    application?: string | undefined;
    pendingInfo?: boolean | undefined;
    language?: number | undefined;
    companyId?: number;
  }

  export interface UserState {
    status: Status;
    userInfo: Object<User>;
    subscriptionstatus: string | undefined;
    other: {} | undefined;
    error: string | undefined;
  }

  export interface Role {
    Id: number;
    Name: string;
  }

  export type AuthState = {
    status: Status;
    error?: string;
    roles?: Role[];
    user?: User | string;
    userId?: number | string;
    username?: string;
    two_factor_auth: 0 | 1;
    otp_required: 0 | 1;
    otpToken?: string;
    language?: number;
    companyId?: number;
    pinAuthed?: boolean;
    hasPin?: boolean;
    firebaseUser?: {
      uid: string;
      email: string | null;
      displayName: string | null;
    };
    authInitialized?: boolean;
  };

  export interface FormAfterCreateUpdate<PayloadInterface> {
    error?: any;
    isValid?: boolean;
    meta?: any;
    response?: PayloadInterface;
  }

  export interface Auth {
    loggedIn: boolean;
  }

  export type Status = "idle" | "pending" | "fulfilled" | "rejected";

  export interface Tag {
    id: number;
    name: string;
  }
}

declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
