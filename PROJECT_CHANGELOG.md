# Project Changelog

## [Latest] - Transaction System Implementation for SM Rewards

### Overview
Implemented a comprehensive transaction system for the SM Rewards feature, including database schema, API endpoints, and frontend integration.

### Database Changes

#### New Schema: `hrm.transactions`
- **Table**: `hrm.transactions` - Stores all financial transactions for users
- **Columns**:
  - `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
  - `user_id` (UUID, FOREIGN KEY to auth.users)
  - `type` (ENUM: 'spend', 'earn', 'transfer', 'topup')
  - `amount` (DECIMAL(10,2))
  - `description` (TEXT)
  - `date` (DATE)
  - `time` (TIME)
  - `status` (ENUM: 'completed', 'pending', 'failed', 'cancelled')
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

#### Database Functions
- **`public.create_transaction()`** - Creates new transactions for authenticated users
- **`public.create_transaction_for_user()`** - Creates new transactions for specified users (SERVICE ROLE only)
- **`public.add_sm_rewards_to_user()`** - Adds SM rewards to specific user balance (bypasses RLS)
- **`public.deduct_sm_rewards_from_user()`** - Deducts SM rewards from specific user balance (bypasses RLS)
- **`hrm.handle_updated_at()`** - Auto-updates `updated_at` timestamp on row changes

#### Security & Access Control
- **Row-Level Security (RLS)** enabled on `hrm.transactions`
- **Policies**:
  - Users can only read their own transactions
  - Users can only insert transactions for themselves
  - Users can only update their own transactions
  - Users can only delete their own transactions

#### Views
- **`public.my_transactions`** - Secure view for users to access their transactions

### New Files Created

#### 1. Transaction Service (`app/shared-ui/lib/utils/supabase/transactions.ts`)
- **Interface**: `Transaction` - TypeScript interface for transaction data
- **Functions**:
  - `getMyTransactions()` - Fetch all transactions for current user
  - `createTransaction()` - Create new transaction with specified parameters
  - `updateTransactionStatus()` - Update transaction status (pending → completed/failed)
  - `getTransactionById()` - Get specific transaction by ID
  - `createTransactionForUser()` - Create transaction for a specific user using database function (for transfers)

#### 2. Enhanced Profiles Service (`app/shared-ui/lib/utils/supabase/profiles.ts`)
- **Added**: `getProfilesForTransfer()` function
  - Fetches all user profiles except the current user
  - Excludes profiles without usernames
  - Sorts profiles alphabetically by username
  - Returns profiles with balance information for transfer selection
- **Added**: `addSMRewardsToUser()` function
  - Adds SM rewards to a specific user's balance
  - Used for transfer operations to update recipient's balance
  - Includes proper error handling and balance validation

### Modified Files

#### 1. Enhanced Profiles Service (`app/shared-ui/lib/utils/supabase/profiles.ts`)
- **Added**: `getProfilesForTransfer()` function for fetching transfer recipients
- **Added**: `addSMRewardsToUser()` function for updating recipient balances
- **Purpose**: Provides real user data for point transfer functionality

#### 2. Enhanced Transaction Service (`app/shared-ui/lib/utils/supabase/transactions.ts`)
- **Updated**: `createTransactionForUser()` function to use database function instead of direct table access
- **Purpose**: Improved security by using database function with SERVICE ROLE controls

#### 3. Enhanced Profiles Service (`app/shared-ui/lib/utils/supabase/profiles.ts`)
- **Updated**: `addSMRewardsToUser()` function to use database function instead of direct table access
- **Updated**: `deductSMRewards()` function to use database function for consistency
- **Purpose**: Bypass RLS policies for balance updates during transfers

#### 4. VNPay Service (`app/shared-ui/lib/utils/vnpay.ts`)
- **Added**: `orderInfo?: string` to `VNPayPaymentRequest` interface
- **Purpose**: Allow passing transaction ID in order info for callback tracking

#### 5. VNPay Create Payment API (`app/api/vnpay/create-payment/route.ts`)
- **Added**: Support for `orderInfo` parameter in request body
- **Modified**: `vnp_OrderInfo` now uses provided `orderInfo` or falls back to default

#### 6. VNPay Callback API (`app/api/vnpay/callback/route.ts`)
- **Added**: Import for `transactionsService`
- **Enhanced**: Transaction status update logic
  - Extracts transaction ID from `orderInfo` using regex pattern `transaction_id:(\d+)`
  - Updates transaction status to 'completed' on successful payment
  - Updates transaction status to 'failed' on payment failure
- **Modified**: Response includes `transactionId` for debugging

#### 7. SM Rewards Page (`app/(dashboard)/sm-rewards/page.tsx`)
- **Added**: Import for `transactionsService` and `Transaction as DBTransaction`
- **Added**: Import for `UserProfile` from profiles service
- **Modified**: Transaction interface to include 'cancelled' status
- **Added**: State management for transaction loading (`isLoadingTransactions`)
- **Added**: State management for transfer profiles (`transferProfiles`, `isLoadingTransferProfiles`)
- **Added**: `fetchTransactions()` function to load transactions from database
- **Added**: `fetchTransferProfiles()` function to load available recipients
- **Enhanced**: `useEffect` to fetch balance, transactions, and transfer profiles on mount
- **Modified**: `handleTopUp()` function:
  - Creates pending transaction before VNPay redirect
  - Includes transaction ID in VNPay order info
  - Updates transaction status on payment failure
  - Refreshes transactions after successful payment
- **Modified**: `handleTransfer()` function:
  - Uses real profile data instead of hardcoded recipients
  - Implements complete transfer flow with both sender and recipient updates
  - Creates transactions for both sender (outgoing) and recipient (incoming)
  - Includes rollback mechanism if recipient update fails
  - Refreshes transaction list after successful transfer
- **Modified**: `handlePurchase()` function:
  - Creates completed transaction in database
  - Refreshes transaction list after successful purchase
- **Enhanced**: VNPay callback handling to refresh transactions
- **Added**: Loading states for transaction history and recent transactions
- **Enhanced**: Transfer modal to show real user profiles with balance information
- **Fixed**: Select component error when profiles are loading (empty string values)
- **Added**: Proper loading states and validation for transfer modal
- **Removed**: Old `addTransaction()` function and mock transaction data

### Transaction Flow Implementation

#### 1. Top-up via VNPay
1. User enters amount and selects VNPay payment method
2. System creates pending transaction in database
3. VNPay payment URL is generated with transaction ID in order info
4. User is redirected to VNPay for payment
5. On callback:
   - If successful: Transaction status updated to 'completed', balance updated
   - If failed: Transaction status updated to 'failed'
6. Transaction list is refreshed to show updated status

#### 2. Other Transactions (Transfer, Purchase, Non-VNPay Top-up)
1. User performs action (transfer, purchase, etc.)
2. System updates balance in database
3. System creates completed transaction in database
4. Transaction list is refreshed to show new transaction

#### 3. Point Transfer Flow (Enhanced)
1. User selects recipient and enters transfer amount
2. System deducts points from sender's balance
3. System adds points to recipient's balance
4. System creates outgoing transaction for sender
5. System creates incoming transaction for recipient
6. If any step fails, system rolls back changes
7. Transaction lists are refreshed for both users

#### 4. Transaction History
1. Transactions are fetched from database on page load
2. Loading states are shown during fetch operations
3. Transactions are displayed with proper icons, colors, and status indicators
4. Filtering and search functionality works with real database data

### Security Features
- **Row-Level Security**: Users can only access their own transactions
- **Authentication**: All transaction operations require user authentication
- **Input Validation**: Transaction amounts and types are validated
- **Error Handling**: Comprehensive error handling for all transaction operations

### Performance Optimizations
- **Efficient Queries**: Uses database views for optimized transaction fetching
- **Loading States**: Prevents UI blocking during data operations
- **Selective Updates**: Only refreshes transaction list when necessary

### Testing Considerations
- **Mock Data**: SQL script includes optional mock data insertion
- **Error Scenarios**: Handles payment failures, network errors, and database errors
- **Edge Cases**: Manages insufficient balance, invalid transaction IDs, etc.

### Future Enhancements
- **Transaction Export**: Add functionality to export transaction history
- **Advanced Filtering**: Add date range filters and transaction type combinations
- **Real-time Updates**: Implement WebSocket connections for live transaction updates
- **Transaction Analytics**: Add charts and statistics for transaction patterns

---

## Previous Changes

### [Initial Setup] - Project Foundation
- Basic Next.js application structure
- Authentication system with Supabase
- UI components with shadcn/ui
- Basic routing and layout 