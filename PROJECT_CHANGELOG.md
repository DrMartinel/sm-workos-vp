# Project Changelog

This document tracks ALL changes made to the sm-workos project. Each entry includes:
- Date and time of change
- What was changed
- Why it was changed
- Impact on the project
- Technical details for future AI assistants

## Project Overview
- **Project Name**: sm-workos
- **Type**: Next.js workspace application with multiple submodules
- **Current State**: Active development with HRM features, timekeeping, meeting booking, and internal announcements
- **Architecture**: Monorepo with shared UI components and domain-specific applications

## Current Project Structure (as of latest commit 3f35254)
```
sm-workos/
├── app/                    # Main Next.js application
│   ├── (dashboard)/        # Dashboard routes
│   │   ├── announcements/  # Internal announcements feature
│   │   ├── applications/   # Applications management
│   │   ├── hrm/           # HR Management features
│   │   │   ├── meeting-booking/  # Room booking system
│   │   │   └── timekeeping/      # Check-in/check-out system
│   │   └── reports/       # Reporting functionality
│   ├── admin/             # Admin panel
│   ├── domain-apps/       # Domain-specific applications
│   ├── shared-ui/         # Shared UI components
│   └── workflow-editor/   # Workflow editing tool
├── data-sources/          # Data source definitions
├── contexts/              # React contexts
└── hooks/                 # Custom React hooks
```

## Recent Git History (Last 10 Commits)
1. **3f35254** (HEAD) - Merge branch 'master' of https://github.com/quangsmg/sm-workos
2. **4ff28ba** - Thay title workspace
3. **cf29fd8** - refactor: Integrate new feature with updated UI
4. **5573ff8** - Merge branch 'master' of https://github.com/quangsmg/sm-workos into timekeeping_feature
5. **a733371** - Shared-UI
6. **c47407b** - feat: Room Booking
7. **5a5919a** - Tạo trang thông báo nội bộ mới (#7) - [COMMIT TO BE REVIEWED]
8. **89acc9e** - Merge pull request #6 from quangsmg/cursor/apply-meeting-booking-status-bar-design-to-timekeeping-dd03
9. **6b335df** - Improve progress steps layout and styling in timekeeping page
10. **85fba26** - Merge pull request #5 from quangsmg/cursor/vietnamese-localization-for-timekeeping-interface-1e48

## Key Features Currently Implemented
1. **Timekeeping System** - Check-in/check-out functionality with Vietnamese localization
2. **Meeting Booking** - Room booking system with status bar design
3. **Internal Announcements** - Internal communication system
4. **Applications Management** - Application tracking with Vietnamese UI
5. **Admin Panel** - User and data access management
6. **Shared UI Components** - Reusable component library
7. **Workflow Editor** - Visual workflow creation tool

## Technical Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui patterns
- **State Management**: React Context + React Query
- **Database**: Supabase (client and server configurations present)
- **Package Manager**: pnpm with workspace configuration
- **PWA Support**: Service worker and manifest files present

## Development Environment
- **OS**: Linux 6.14.0-24-generic
- **Shell**: /usr/bin/bash
- **Workspace Path**: /home/drmartinel/Desktop/sm-workos
- **Node Version**: (to be determined)
- **Package Manager**: pnpm

## Pending Actions
- **Commit Review**: User wants to review commit 5a5919a ("Tạo trang thông báo nội bộ mới (#7)") without losing current commits
- **Documentation**: This changelog is being created to ensure future AI assistants have complete project context

## Notes for Future AI Assistants
- This is a Vietnamese-localized HR management system
- The project uses a monorepo structure with shared components
- All UI text should be in Vietnamese unless specified otherwise
- The project has PWA capabilities and service worker implementation
- There are multiple submodules and workspace configurations
- The user prefers comprehensive documentation of all changes

---

## Change Log Entries

### [2024-12-19] - Initial Documentation Setup
**What Changed**: Created PROJECT_CHANGELOG.md
**Why**: User requested comprehensive documentation of all changes for future AI assistants
**Impact**: Establishes baseline documentation system
**Technical Details**: 
- Document created at project root level
- Captures current project state, structure, and recent git history
- Includes technical stack, development environment, and pending actions
- Designed to be updated with every change made to the project

### [2024-12-19] - Added Routing Functionality to Applications Page
**What Changed**: Added click-to-navigate functionality to application cards in the applications page
**Why**: User requested that each teamData application should have its own specified path, with sm-rewards having a working route and others having placeholder empty strings
**Impact**: 
- sm-rewards application now navigates to `/applications/sm-rewards` when clicked
- All other applications are clickable but don't navigate (placeholder behavior as requested)
- Maintains existing folder structure without creating new files
**Technical Details**: 
- Added `useRouter` import from `next/navigation`
- Created `handleCardClick` function in ApplicationCard component
- Implemented `routingPaths` object to map application IDs to their routes
- Currently only sm-rewards has a defined path: `/applications/sm-rewards`
- Other applications have empty string placeholders as requested
- Added onClick handler to Card component
- Preserved existing favorite toggle functionality with event.stopPropagation()
- Maintained Vietnamese localization and existing UI styling

### [2024-12-19] - Integrated Canteen Products Database with SM Rewards System
**What Changed**: Created comprehensive integration between Supabase canteen_products table and SM Rewards QR payment system
**Why**: User created a canteen_products table in Supabase and wanted to use it to fetch and populate product data across the menu system
**Impact**: 
- Real product data now populates the SM Rewards system from Supabase database
- Enhanced QR code scanning with actual product information
- Created dedicated menu page to browse all available products
- Improved product display with stock information and descriptions
- Added balance validation and stock checking in purchase flow
**Technical Details**: 
- Created `canteenProductsService` in `app/shared-ui/lib/utils/supabase/canteen-products.ts`
- Implemented TypeScript interfaces for `CanteenProduct` matching database schema
- Added methods for fetching all products, single products, and QR code parsing
- Created new menu page at `/applications/sm-rewards/menu` with search, filtering, and sorting
- Enhanced SM Rewards scan modal to show product descriptions, stock levels, and balance validation
- Updated scan functionality to fetch real product data from database
- Added "View Menu" button to SM Rewards main page
- Implemented QR code generation and parsing utilities
- Added proper error handling and fallback to mock data
- Maintained Vietnamese localization throughout the interface 