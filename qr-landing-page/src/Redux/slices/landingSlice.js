import { createSlice } from "@reduxjs/toolkit";
import { fetchLandingData } from "../thunks/landingThunks";

const landingSlice = createSlice({
  name: "landing",
  initialState: {
    company: null,
    scans: 0,
    candidateWebUrl: "",
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLandingData.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload.company;
        state.scans = action.payload.scans;
        state.candidateWebUrl = action.payload.candidateWebUrl || "";
      })
      .addCase(fetchLandingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default landingSlice.reducer;
