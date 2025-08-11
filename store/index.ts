import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'

// Configure the Redux store
export const store = configureStore({
  reducer: {
    user: userReducer,
    // Add other slices here as needed
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
})

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 