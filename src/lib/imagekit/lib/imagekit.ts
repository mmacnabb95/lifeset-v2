// TEMPORARY STUB - ImageKit deprecated, migrating to Firebase Storage
// TODO: Replace all ImageKit usage with Firebase Storage in Phase 3

import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

// Stub types to prevent errors
interface UploadResponse {
  url: string;
  fileId: string;
  name: string;
}

interface IKResponse<T> {
  data: T;
  error?: any;
}

// Stub implementation - throws errors for now
const getImageKit = async () => {
  return {
    upload: async () => {
      throw new Error('ImageKit deprecated - Use Firebase Storage instead');
    },
    url: (options: any) => {
      // Return a placeholder for now
      return 'https://via.placeholder.com/400';
    },
  };
};

const uploadFile = async (
  file: any,
  fileName: string,
  folder?: string
): Promise<UploadResponse> => {
  throw new Error('ImageKit deprecated - Use Firebase Storage instead');
};

const getImageUrl = (
  path: string,
  transformation?: any[]
): string => {
  // Return placeholder for now
  return 'https://via.placeholder.com/400';
};

const deleteFile = async (fileId: string): Promise<void> => {
  throw new Error('ImageKit deprecated - Use Firebase Storage instead');
};

// Export stub functions
export {
  getImageKit,
  uploadFile,
  getImageUrl,
  deleteFile,
};

export default {
  getImageKit,
  uploadFile,
  getImageUrl,
  deleteFile,
};
