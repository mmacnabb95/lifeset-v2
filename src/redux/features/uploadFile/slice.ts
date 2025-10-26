import {
  createAsyncThunk,
  createSlice,
  createSelector,
} from "@reduxjs/toolkit";
import { AppState } from "../../reducer/root-reducer";
import { fetchClient } from "src/utils/legacy-stubs";
import { UploadFileState } from "uiTypes";

export interface S3FileKey {
  location: string;
  locationId: string | number;
  slug: string;
}

export interface DeleteFileUploaded {
  location: string;
  locationId: string;
  slug: string;
}

export interface FileUpload {
  // eslint-disable-next-line no-undef
  file?: File;
  data: string | ArrayBuffer | null;
}

export interface s3ListFIles {
  location: string;
  locationId: number | undefined;
  name?: string;
  fileType?: string;
  size?: string;
  date?: string;
}

const initialState: UploadFileState = {
  status: "idle",
  uploadedFiles: undefined,
  uploadedFile: undefined,
  error: undefined,
  Deleted: undefined,
};

export const addUploadedFile = createAsyncThunk(
  "set/upload-file",
  async (params: FileUpload | any) => {
    params.file.type = params.file.file.type;
    params.file.name = params.file.file.name;
    params.file.size = params.file.file.size;
    params.file.lastModified = params.file.file.lastModified;
    const { data } = await (
      await fetchClient()
    ).post("add-upload-file", { ...params });
    return data;
  },
);

export const deleteUploadedFile = createAsyncThunk(
  "delete/upload-file",
  async (params: S3FileKey) => {
    const { data } = await (
      await fetchClient()
    ).post("delete-upload-file", {
      ...params,
    });
    return data;
  },
);

/* not used, use the outer with the key of the file Ex = localhost:3000/media/location/locationId/slug

export const getUploadedFile = createAsyncThunk(
  "get/upload-file",
  async (params: S3FileKey) => {
    const { data } = await fetchClient().get(`get-upload-file`, { params });
    return data;
  }
);

*/

export const getUploadedProfile = createAsyncThunk(
  "get/upload-profile",
  async (params: s3ListFIles) => {
    const { data } = await (
      await fetchClient()
    ).get("get-upload-profile", { params });
    return data;
  },
);

export const getCollectionFiles = createAsyncThunk(
  "get/upload-file/collection",
  async (params: s3ListFIles) => {
    const { data } = await (
      await fetchClient()
    ).get("get-collection-file", { params });
    return data;
  },
);

export const getSpecificCollectionFiles = createAsyncThunk(
  "get/upload-file/collection",
  async (params: s3ListFIles) => {
    const { data } = await (
      await fetchClient()
    ).get("get-collection-file", { params });
    return data;
  },
);

export const uploadSpecificCollectionFiles = createAsyncThunk(
  "set/upload-file/collection",
  async (params: FileUpload | any) => {
    params.file.type = params.file.file.type;
    params.file.name = params.file.file.name;
    params.file.size = params.file.file.size;
    params.file.lastModified = params.file.file.lastModified;
    const { data } = await (
      await fetchClient()
    ).post("add-upload-file-collection", {
      ...params,
    });
    return data;
  },
);

export const deleteSpecificCollectionFiles = createAsyncThunk(
  "delete/upload-file-specific-collection",
  async (params: S3FileKey) => {
    const { data } = await (
      await fetchClient()
    ).post("delete-upload-file", {
      ...params,
    });
    return data;
  },
);

export const deleteCollectionFiles = createAsyncThunk(
  "delete/upload-file/collection",
  async (params: S3FileKey) => {
    const { data } = await (
      await fetchClient()
    ).post("delete-collection-file", {
      params,
    });
    return data;
  },
);

const uploadFileSlice = createSlice({
  name: "uploadFile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addUploadedFile.pending, (state: UploadFileState) => {
      state.status = "pending";
    });
    builder.addCase(
      addUploadedFile.fulfilled,
      (state: UploadFileState, action) => {
        state.uploadedFile = action.payload;
        state.status = "fulfilled";
      },
    );
    builder.addCase(getCollectionFiles.pending, (state: UploadFileState) => {
      state.status = "pending";
    });
    builder.addCase(
      getCollectionFiles.fulfilled,
      (state: UploadFileState, action) => {
        state.uploadedFiles = action.payload;
        state.status = "fulfilled";
      },
    );
    builder.addCase(deleteUploadedFile.pending, (state: UploadFileState) => {
      state.status = "pending";
    });
    builder.addCase(
      deleteUploadedFile.fulfilled,
      (state: UploadFileState, action) => {
        state.uploadedFile = undefined;
        state.Deleted = action.payload;
        state.status = "fulfilled";
      },
    );
    builder.addCase(deleteCollectionFiles.pending, (state: UploadFileState) => {
      state.status = "pending";
    });
    builder.addCase(
      deleteCollectionFiles.fulfilled,
      (state: UploadFileState, action) => {
        state.uploadedFiles = undefined;
        state.Deleted = action.payload.Deleted;
        state.status = "fulfilled";
      },
    );

    builder.addCase(getUploadedProfile.pending, (state: UploadFileState) => {
      state.status = "pending";
    });
    builder.addCase(
      getUploadedProfile.fulfilled,
      (state: UploadFileState, action) => {
        state.uploadedFile = action.payload;
        state.status = "fulfilled";
      },
    );
  },
});

const newsStateSelector = (state: AppState): UploadFileState =>
  state.uploadFile;

export const getUploadedFileSelector = createSelector(
  newsStateSelector,
  (uploadFile) => uploadFile.uploadedFile,
);

export const getUploadedCollectionSelector = createSelector(
  newsStateSelector,
  (uploadFile) => uploadFile.uploadedFiles,
);

export default uploadFileSlice.reducer;
