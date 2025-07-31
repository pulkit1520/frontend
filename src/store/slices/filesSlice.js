import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  files: [],
  selectedFile: null,
  uploadProgress: 0,
  isUploading: false,
  loading: false,
  error: null,
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
      state.loading = false;
      state.error = null;
    },
    addFile: (state, action) => {
      state.files = [action.payload, ...state.files];
    },
    removeFile: (state, action) => {
      state.files = state.files.filter(file => file._id !== action.payload);
    },
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setUploading: (state, action) => {
      state.isUploading = action.payload;
      if (!action.payload) {
        state.uploadProgress = 0;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setFiles,
  addFile,
  removeFile,
  setSelectedFile,
  setUploadProgress,
  setUploading,
  setLoading,
  setError,
  clearError,
} = filesSlice.actions;

export default filesSlice.reducer;
