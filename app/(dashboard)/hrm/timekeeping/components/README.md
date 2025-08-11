# Timekeeping Components

This directory contains the modular components for the timekeeping page, broken down for better debugging and maintainability.

## Component Structure

### Core Components

- **`AttendanceStatusBanner.tsx`** - Displays current check-in/check-out status with action buttons
- **`MonthlySummary.tsx`** - Shows monthly statistics (hours, OT, efficiency, penalties)
- **`Calendar.tsx`** - Main calendar view with filtering and navigation
- **`RequestHistory.tsx`** - Request history with search and filtering capabilities

### Flow Components

- **`CheckInFlow.tsx`** - Complete check-in process (location → photo → confirmation)
- **`CheckOutFlow.tsx`** - Check-out process with location verification

### Dialog Components

- **`Dialogs.tsx`** - Contains all modal dialogs:
  - `RequestDetailDialog` - View request details
  - `AttendanceDetailDialog` - View attendance details for a day
  - `CreateRequestDialog` - Create new request
  - `EditRequestDialog` - Edit existing request

### Utilities

- **`timekeepingUtils.ts`** - Utility functions for:
  - Calendar data generation
  - Statistics calculations
  - Location checking
  - Date utilities

## Benefits of This Structure

1. **Easier Debugging** - Each component has a single responsibility
2. **Better Maintainability** - Changes to one component don't affect others
3. **Reusability** - Components can be reused in other parts of the application
4. **Testing** - Each component can be tested independently
5. **Code Organization** - Clear separation of concerns

## Usage

```typescript
// Import individual components
import { AttendanceStatusBanner } from './components/AttendanceStatusBanner'
import { Calendar } from './components/Calendar'

// Or import from index
import { 
  AttendanceStatusBanner, 
  Calendar, 
  RequestHistory 
} from './components'
```

## Props Interface

Each component has a well-defined TypeScript interface for its props, making it easy to understand what data each component expects and provides. 