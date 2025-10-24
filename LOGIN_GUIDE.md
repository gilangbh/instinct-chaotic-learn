# 🔐 Login/Logout System Guide

## Overview
The login/logout system has been implemented with a beautiful themed UI and mock data support.

## Features Implemented

### ✅ Login System
- **LoginDialog Component**: A beautiful modal dialog with themed form
- **Mock User Support**: Quick login buttons for testing
- **Form Validation**: Username and wallet address validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Proper loading indicators during login

### ✅ UI Updates
- **StickyHeader**: Added Login button (shown when not authenticated)
- **Dashboard**: Added Logout button next to Profile button
- **User Display**: Shows logged-in username in Dashboard header

### ✅ Authentication Flow
1. **Login Attempt**: Tries to connect to API first
2. **Fallback**: Falls back to mock data if API is unavailable
3. **WebSocket**: Initializes WebSocket connection on login
4. **LocalStorage**: Saves wallet address and username
5. **Logout**: Clears user data, disconnects WebSocket, removes localStorage

## How to Use

### Login Flow

#### Option 1: Manual Login
1. Visit the landing page (Index page)
2. Click "Login" button in the header
3. Enter wallet address (e.g., "7xKz...9kL2")
4. Enter username (e.g., "CryptoNinja")
5. Click "Connect Wallet"
6. **✨ Automatically redirects to Dashboard** (`/dashboard`)

#### Option 2: Quick Login (Mock Data)
1. Click "Login" button in the header
2. Choose one of the quick login buttons:
   - 🥷 Login as CryptoNinja
   - 👑 Login as SolanaKing
   - 👸 Login as DeFiQueen
3. **✨ Automatically redirects to Dashboard** (`/dashboard`)

### Logout Flow
1. Navigate to Dashboard
2. Click "Logout" button (red button with logout icon)
3. User data is cleared, WebSocket disconnected
4. **✨ Automatically redirects to Index page** (`/`)

## Components Created

### 1. LoginDialog.tsx
Location: `/src/components/LoginDialog.tsx`

**Features**:
- Modal dialog using shadcn/ui Dialog component
- Themed form matching the app's design
- Wallet address input field
- Username input field
- Form validation
- Error display
- Loading states
- Quick login buttons for mock users
- Info box explaining demo nature

**Props**:
- `open: boolean` - Controls dialog visibility
- `onOpenChange: (open: boolean) => void` - Callback for dialog state changes

### 2. Updated StickyHeader.tsx
Location: `/src/components/StickyHeader.tsx`

**Changes**:
- Added `useAuth` hook
- Added `useState` for dialog control
- Added Login button (only shown when not authenticated)
- Added LoginDialog component

### 3. Updated Dashboard.tsx
Location: `/src/pages/Dashboard.tsx`

**Changes**:
- Added `useAuth` hook to access user and logout
- Added Logout button next to Profile button
- Display logged-in username in header subtitle

### 4. Updated AuthContext.tsx
Location: `/src/contexts/AuthContext.tsx`

**Changes**:
- Enhanced login function with API fallback to mock data
- Saves username to localStorage
- Clears username on logout
- Better error handling

## Mock Users Available

### CryptoNinja
- Wallet: `7xKz...9kL2`
- Username: `CryptoNinja`

### SolanaKing
- Wallet: `8aB2...3mN4`
- Username: `SolanaKing`

### DeFiQueen
- Wallet: `9cD3...5oP6`
- Username: `DeFiQueen`

## Technical Details

### Authentication State
- Managed by `AuthContext` (React Context)
- User object stored in state
- Wallet address and username saved to localStorage
- WebSocket connection initialized on login

### Form Validation
- Wallet address: Minimum 4 characters
- Username: Minimum 3 characters
- Both fields required

### API Integration
- Tries to connect to backend API first
- Falls back to mock data if API fails
- Supports both new user creation and existing user login

### WebSocket Integration
- WebSocket connection initialized on successful login
- Disconnected on logout
- Connected to `/ws` endpoint on backend

### Navigation Flow
- **After Login**: Automatically redirects to `/dashboard`
- **After Logout**: Automatically redirects to `/` (Index page)
- Uses React Router's `useNavigate` hook for navigation

## Styling

The login dialog matches the app's theme:
- **Colors**: Uses theme colors (primary, muted, destructive, etc.)
- **Shadows**: Soft shadows matching card styling
- **Borders**: Theme border colors
- **Gradients**: Primary gradient for submit button
- **Icons**: Lucide React icons (Wallet, User, LogIn, LogOut)

## Testing

To test the login/logout flow:

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Visit localhost:3000**

3. **Test Login**:
   - Click "Login" in header
   - Try quick login with "Login as CryptoNinja"
   - Verify dialog closes
   - **✨ Verify redirect to Dashboard**
   - Check console for "API failed, using mock data" message

4. **Verify Login State**:
   - Should be on `/dashboard` page
   - See username displayed in header
   - See Logout button
   - Login button should NOT appear in header

5. **Test Logout**:
   - Click "Logout" button
   - Verify user is logged out
   - **✨ Verify redirect to Index page** (`/`)
   - Check that Login button reappears in header

## Future Enhancements

Potential improvements for production:
- Real Solana wallet integration (Phantom, Solflare)
- JWT token-based authentication
- Refresh token mechanism
- Protected routes
- Session timeout handling
- Remember me functionality
- Social login options

