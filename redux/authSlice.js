import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
    },
    reducers: {
        saveToken: (state, action) => {
            state.token = action.payload;
        },
        clearToken: (state) => {
            state.token = null;
        },
    },
});

export const { saveToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
