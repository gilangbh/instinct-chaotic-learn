# 🔐 Solana Wallet Integration Guide

## Overview
Instinct.fi now supports **native Solana wallet authentication** using popular wallets like Phantom, Backpack, Solflare, and more. The integration uses Solana Devnet for testing.

---

## 🎯 Features Implemented

### ✅ Frontend Features
- **Multi-Wallet Support**: Phantom, Backpack, Solflare, Coinbase Wallet, Trust Wallet
- **Message Signing**: Secure authentication via wallet signature
- **Dual Login Modes**: Solana Wallet + Demo Login tabs
- **Auto-Connect**: Automatic wallet reconnection
- **Real-time Status**: Connected wallet display
- **Devnet Support**: Configured for Solana Devnet testing

### ✅ Backend Features
- **Signature Verification**: Cryptographic verification using ed25519
- **User Management**: Auto-create or update users via wallet
- **Secure Endpoints**: Wallet verification API
- **Devnet Compatible**: Works with Solana Devnet

---

## 📦 Packages Installed

### Frontend Dependencies
```json
{
  "@solana/wallet-adapter-base": "^0.9.x",
  "@solana/wallet-adapter-react": "^0.15.x",
  "@solana/wallet-adapter-react-ui": "^0.9.x",
  "@solana/wallet-adapter-wallets": "^0.19.x",
  "@solana/web3.js": "^1.x",
  "bs58": "^5.x"
}
```

### Backend Dependencies
```json
{
  "@solana/web3.js": "^1.x",
  "bs58": "^5.x",
  "tweetnacl": "^1.x"
}
```

---

## 🏗️ Architecture

### Frontend Flow
```
User Opens Login Dialog
    ↓
Selects "Solana Wallet" Tab
    ↓
Clicks "Select Wallet" → Wallet List Appears
    ↓
Selects Wallet (e.g., Phantom)
    ↓
Wallet Extension Opens → User Approves Connection
    ↓
Wallet Connected ✅
    ↓
User Enters Username
    ↓
Clicks "Sign & Authenticate"
    ↓
Wallet Prompts for Signature
    ↓
User Signs Message
    ↓
Frontend Sends: {walletAddress, username, message, signature}
    ↓
Backend Verifies Signature
    ↓
User Logged In → Redirect to Dashboard
```

### Backend Verification Flow
```
POST /api/v1/auth/wallet/verify
    ↓
Receive: {walletAddress, username, message, signature}
    ↓
Validate Wallet Address Format
    ↓
Decode Signature (base58)
    ↓
Verify Signature using nacl.sign.detached.verify()
    ↓
If Valid:
  - Check if user exists
  - Create new user OR update existing
  - Return user data
    ↓
If Invalid:
  - Return 401 Unauthorized
```

---

## 📁 Files Created/Modified

### Frontend Files

#### Created:
1. **`src/contexts/WalletProvider.tsx`**
   - Solana wallet adapter provider
   - Configures supported wallets
   - Sets up Devnet connection
   - Wraps entire app

#### Modified:
2. **`src/App.tsx`**
   - Added SolanaWalletProvider wrapper
   - Wraps AuthProvider

3. **`src/components/LoginDialog.tsx`**
   - Completely redesigned with tabs
   - Added "Solana Wallet" tab
   - Added "Demo Login" tab
   - Wallet connection UI
   - Message signing implementation
   - Username input for wallet users

4. **`src/contexts/AuthContext.tsx`**
   - Added `loginWithWallet()` function
   - Calls backend verification endpoint
   - Handles wallet-based authentication
   - Fallback to mock data if API fails

5. **`src/lib/api.ts`**
   - Added `auth.verifyWallet()` endpoint

### Backend Files

#### Created:
6. **`src/controllers/AuthController.ts`**
   - `verifyWallet()` method
   - Signature verification logic
   - User creation/update logic

7. **`src/routes/authRoutes.ts`**
   - POST `/auth/wallet/verify` route

#### Modified:
8. **`src/routes/index.ts`**
   - Added auth routes
   - Updated route parameters

9. **`src/index.ts`**
   - Initialized AuthController
   - Imported AuthController
   - Passed to createRoutes()

---

## 🔑 How to Use

### For Users (Frontend)

#### Option 1: Solana Wallet Login
1. **Install a Solana Wallet**:
   - Phantom: https://phantom.app/
   - Backpack: https://backpack.app/
   - Solflare: https://solflare.com/

2. **Get Devnet SOL** (for testing):
   - Visit: https://faucet.solana.com/
   - Paste your wallet address
   - Request devnet SOL

3. **Login Process**:
   ```
   1. Click "Login" button
   2. Select "Solana Wallet" tab
   3. Click "Select Wallet"
   4. Choose your wallet (e.g., Phantom)
   5. Approve connection in wallet
   6. Enter your username
   7. Click "Sign & Authenticate"
   8. Sign the message in your wallet
   9. ✅ Logged in!
   ```

#### Option 2: Demo Login
1. Click "Login" button
2. Select "Demo Login" tab
3. Use quick login buttons or enter manually
4. Works without wallet

---

## 🧪 Testing

### Prerequisites
1. **Solana Wallet Extension** installed (Phantom, Backpack, etc.)
2. **Devnet SOL** in wallet (optional, needed for transactions)
3. **Backend running** on port 3001
4. **Frontend running** on port 3000

### Test Steps

#### 1. Test Wallet Connection
```bash
# Start backend
cd instinct-fi-api
npm run dev

# Start frontend (new terminal)
cd instinct-chaotic-learn
npm run dev
```

#### 2. Test Login Flow
1. Visit `http://localhost:3000`
2. Click "Login"
3. Go to "Solana Wallet" tab
4. Connect wallet
5. Enter username: "TestUser"
6. Sign message
7. Verify redirect to Dashboard
8. Check browser console for logs

#### 3. Verify Backend
```bash
# Check backend logs
# Should see:
✅ Wallet signature verified for <wallet-address>
Creating new user for wallet <wallet-address>
```

---

## 🔐 Security Features

### Frontend Security
- **Message Signing**: Users sign a unique message
- **Timestamp**: Message includes timestamp for freshness
- **No Private Keys**: Never exposes private keys
- **Secure Communication**: HTTPS recommended for production

### Backend Security
- **Signature Verification**: Uses `nacl.sign.detached.verify()`
- **Public Key Validation**: Validates Solana address format
- **Input Sanitization**: Validates all inputs
- **Error Handling**: Secure error messages

---

## 📝 API Endpoints

### POST `/api/v1/auth/wallet/verify`

**Request:**
```json
{
  "walletAddress": "Ht7j...k3Lm",
  "username": "CryptoNinja",
  "message": "Sign this message to authenticate with Instinct.fi\n\nWallet: Ht7j...k3Lm\nTimestamp: 1234567890",
  "signature": "5K7m...n8Qp"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "walletAddress": "Ht7j...k3Lm",
    "username": "CryptoNinja",
    "xp": 0,
    "totalRuns": 0,
    "winRate": 0,
    "badges": []
  },
  "message": "Wallet verified successfully"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid signature"
}
```

---

## 🎨 UI/UX Features

### Login Dialog
- **Tabbed Interface**: Clean separation between wallet and demo login
- **Wallet Connect Button**: Prominent "Select Wallet" button
- **Connected Status**: Shows connected wallet address
- **Username Input**: Required for wallet users
- **Sign Button**: "Sign & Authenticate" with loading state
- **Devnet Notice**: Informs users about Devnet usage

### Supported Wallets Display
- Phantom
- Backpack
- Solflare
- Coinbase Wallet
- Trust Wallet
- Mobile wallets via Solana Mobile Stack

---

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Switch from Devnet to Mainnet-Beta
- [ ] Use custom RPC endpoint (not public clusterApiUrl)
- [ ] Enable HTTPS
- [ ] Add rate limiting to auth endpoints
- [ ] Implement session management
- [ ] Add CSRF protection
- [ ] Store JWT tokens securely
- [ ] Add wallet disconnection handling
- [ ] Implement refresh tokens
- [ ] Add transaction signing for actions

### Environment Variables
```env
# Backend
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Frontend
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Wallet not detected"
- **Solution**: Install wallet extension and refresh page

#### 2. "Failed to connect wallet"
- **Solution**: 
  - Check if wallet is unlocked
  - Try different wallet
  - Clear browser cache

#### 3. "Invalid signature" error
- **Solution**:
  - Ensure you're signing the message in wallet
  - Check backend logs for verification details
  - Verify message format matches

#### 4. "No provider found"
- **Solution**:
  - Install wallet extension
  - Enable extension in browser
  - Refresh page

---

## 📚 Technical Details

### Signature Verification (Backend)
```typescript
// Message is signed by wallet
const messageBytes = new TextEncoder().encode(message);

// Signature is sent as base58
const signatureBytes = bs58.decode(signature);

// Public key from wallet address
const publicKeyBytes = publicKey.toBytes();

// Verify using ed25519
const isValid = nacl.sign.detached.verify(
  messageBytes,
  signatureBytes,
  publicKeyBytes
);
```

### Wallet Adapters
Each wallet implements the `WalletAdapter` interface:
- `connect()`: Establish connection
- `disconnect()`: Close connection
- `signMessage()`: Sign arbitrary message
- `signTransaction()`: Sign Solana transaction
- `publicKey`: User's public key

---

## 🔮 Future Enhancements

Potential improvements:
- [ ] Transaction signing for game actions
- [ ] NFT-based authentication
- [ ] Multi-signature support
- [ ] Hardware wallet support (Ledger, Trezor)
- [ ] Social recovery
- [ ] Gas-less transactions
- [ ] Mobile wallet deep linking
- [ ] QR code wallet connection

---

## ✅ Summary

### What Works Now
✅ Phantom wallet connection  
✅ Backpack wallet connection  
✅ Solflare wallet connection  
✅ Message signing authentication  
✅ Backend signature verification  
✅ User creation/update  
✅ Devnet support  
✅ Demo login fallback  
✅ Responsive UI  
✅ Error handling  

### Network
🌐 **Devnet** (Testing)  
📡 RPC: `https://api.devnet.solana.com`  

Enjoy secure, wallet-based authentication! 🚀



