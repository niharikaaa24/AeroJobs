import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: false,
        user: null
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setUser: (state, action) => {
            // Log the incoming user data for debugging
            console.log("Setting user in Redux store:", action.payload);
            console.log("User profile data:", action.payload?.profile);
            
            // Ensure we're properly handling the profile data
            if (action.payload && action.payload.profile) {
                // Make sure we preserve all profile fields
                const profile = {
                    ...action.payload.profile,
                    resume: action.payload.profile.resume || null,
                    resumeOriginalName: action.payload.profile.resumeOriginalName || null
                };
                
                state.user = {
                    ...action.payload,
                    profile
                };
            } else {
                state.user = action.payload;
            }
            
            // Log the updated state for verification
            console.log("Updated user state:", state.user);
        }
    }
});

export const {setLoading, setUser} = authSlice.actions;
export default authSlice.reducer;