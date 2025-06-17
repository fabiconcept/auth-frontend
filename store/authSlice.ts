import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { authApi } from "./authApi"

interface AuthState {
  accessToken: string | null
  user: {
    id: string
    email: string
    name: string
  } | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user?: any }>) => {
      state.accessToken = action.payload.accessToken
      if (action.payload.user) {
        state.user = action.payload.user
      }
      state.isAuthenticated = true
    },
    clearCredentials: (state) => {
      state.accessToken = null
      state.user = null
      state.isAuthenticated = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload.user
      })
      .addMatcher(authApi.endpoints.refresh.matchFulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.accessToken = null
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
