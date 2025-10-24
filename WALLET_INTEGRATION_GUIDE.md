# 🔐 Solana Wallet Integration Guide

## 📦 Packages Used

We use the official **Solana Wallet Adapter** packages for wallet integration:

```json
"@solana/wallet-adapter-base": "^0.9.27",
"@solana/wallet-adapter-react": "^0.15.39",
"@solana/wallet-adapter-react-ui": "^0.9.39",
"@solana/wallet-adapter-wallets": "^0.19.37",
"@solana/web3.js": "^1.98.4",
"bs58": "^6.0.0"
```

### Package Breakdown:

1. **`@solana/wallet-adapter-base`**
   - Core types and utilities
   - Network definitions (Mainnet, Devnet, Testnet)

2. **`@solana/wallet-adapter-react`**
   - React hooks and providers
   - `ConnectionProvider`, `WalletProvider`
   - `useWallet()`, `useConnection()` hooks

3. **`@solana/wallet-adapter-react-ui`**
   - Pre-built UI components
   - `WalletModalProvider`, `WalletMultiButton`
   - Ready-to-use wallet selection modal

4. **`@solana/wallet-adapter-wallets`**
   - Individual wallet adapters
   - PhantomWalletAdapter, SolflareWalletAdapter, etc.

5. **`@solana/web3.js`**
   - Solana blockchain interaction
   - PublicKey, Transaction, Connection classes
   - RPC calls and cluster utilities

6. **`bs58`**
   - Base58 encoding/decoding
   - Convert signatures and keys to/from base58 format

---

## 🏗️ Architecture Overview

### 1. **Provider Setup** (`src/contexts/WalletProvider.tsx`)

```typescript
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
```

**Three-layer provider structure:**

```
<ConnectionProvider>          ← Solana RPC connection
  <WalletProvider>            ← Wallet state management
    <WalletModalProvider>     ← UI modal for wallet selection
      <App />
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>
```

### 2. **Custom Wallet Detection** (`src/components/LoginDialog.tsx`)

Instead of using the default `WalletMultiButton`, we built a custom wallet connection flow:

```typescript
// Detect wallets via window object
const wallets = [
  { name: 'Phantom', installed: !!(window as any).solana?.isPhantom },
  { name: 'Solflare', installed: !!(window as any).solflare },
  { name: 'Backpack', installed: !!(window as any).backpack },
  { name: 'Sollet', installed: !!(window as any).sollet }
];
```

**Why custom detection?**
- Better UX control
- Mobile wallet support (deep links)
- Custom error handling
- Brand-specific UI

### 3. **Connection Flow**

```typescript
// 1. Get wallet provider from window
const provider = (window as any).solana; // or solflare, backpack, etc.

// 2. Connect to wallet
const response = await provider.connect();

// 3. Extract public key (varies by wallet)
const publicKey = response.publicKey.toString();

// 4. Sign authentication message
const message = "Sign this message to authenticate...";
const encodedMessage = new TextEncoder().encode(message);
const signature = await provider.signMessage(encodedMessage);

// 5. Send to backend for verification
await loginWithWallet(publicKey, username, message, signatureBase58);
```

---

## ➕ How to Add More Wallets

### Step 1: Install Wallet Adapter

Most popular Solana wallets are already included in `@solana/wallet-adapter-wallets`:

```bash
npm install @solana/wallet-adapter-wallets
```

### Step 2: Import Wallet Adapter

Add to `src/contexts/WalletProvider.tsx`:

```typescript
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  // Add new wallets here:
  BackpackWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  SlopeWalletAdapter,
  TorusWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';
```

### Step 3: Add to Wallets Array

```typescript
const wallets = useMemo(
  () => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),        // ✅ Added
    new CoinbaseWalletAdapter(),        // ✅ Added
    new LedgerWalletAdapter(),          // ✅ Added
    new MathWalletAdapter(),            // ✅ Added
    new SlopeWalletAdapter(),           // ✅ Added
    new TorusWalletAdapter(),           // ✅ Added
    new TrustWalletAdapter(),           // ✅ Added
  ],
  [network]
);
```

### Step 4: Add to Custom Detection (Optional)

If using custom wallet UI in `LoginDialog.tsx`:

```typescript
const wallets: WalletInfo[] = [
  {
    name: 'Phantom',
    icon: '👻',
    url: 'https://phantom.app/',
    installed: !!(window as any).solana?.isPhantom
  },
  {
    name: 'Solflare',
    icon: '☀️',
    url: 'https://solflare.com/',
    installed: !!(window as any).solflare
  },
  // ✅ Add new wallet
  {
    name: 'Backpack',
    icon: '🎒',
    url: 'https://backpack.app/',
    installed: !!(window as any).backpack
  },
  {
    name: 'Coinbase',
    icon: '🔵',
    url: 'https://www.coinbase.com/wallet',
    installed: !!(window as any).coinbaseSolana
  },
];
```

### Step 5: Update Connection Handler

Add wallet provider detection:

```typescript
const handleConnectWallet = async (wallet: WalletInfo) => {
  let provider;
  
  if (wallet.name === 'Phantom') {
    provider = (window as any).solana;
  } else if (wallet.name === 'Solflare') {
    provider = (window as any).solflare;
  } else if (wallet.name === 'Backpack') {
    provider = (window as any).backpack;
  } else if (wallet.name === 'Coinbase') {
    provider = (window as any).coinbaseSolana;  // ✅ Added
  }
  
  // ... rest of connection logic
};
```

---

## 🌟 Supported Wallets

### Currently Integrated:
- ✅ **Phantom** - Most popular Solana wallet
- ✅ **Solflare** - Feature-rich web & mobile wallet

### Available to Add:
- 🎒 **Backpack** - Multi-chain wallet with xNFT support
- 🔵 **Coinbase Wallet** - Major exchange wallet
- 🔐 **Ledger** - Hardware wallet
- 🌊 **Slope** - Mobile-first wallet
- 🔷 **Torus** - Social login wallet
- ⛓️ **Trust Wallet** - Multi-chain mobile wallet
- 🧮 **Math Wallet** - Multi-chain wallet
- 🌐 **Sollet** - Web-based wallet

---

## 📱 Mobile Wallet Support

We support mobile wallets via **deep linking**:

```typescript
const deepLinks = {
  'Phantom': 'phantom://browse',
  'Solflare': 'solflare://browse',
  'Backpack': 'backpack://browse'
};

// Redirect to wallet app
window.location.href = deepLinks[wallet.name];
```

**Add new mobile wallet:**

1. Find wallet's deep link URL scheme (check wallet documentation)
2. Add to `deepLinks` object
3. Mobile detection will handle the rest

---

## 🔒 Authentication Flow

### Frontend (LoginDialog.tsx):

1. **Connect Wallet**
   ```typescript
   const response = await provider.connect();
   const publicKey = response.publicKey.toString();
   ```

2. **Create Message**
   ```typescript
   const message = `Sign this message to authenticate with Instinct.fi
   Wallet: ${publicKey}
   Username: ${username}
   Timestamp: ${Date.now()}`;
   ```

3. **Sign Message**
   ```typescript
   const encodedMessage = new TextEncoder().encode(message);
   const signature = await provider.signMessage(encodedMessage);
   const signatureBase58 = bs58.encode(signature);
   ```

4. **Send to Backend**
   ```typescript
   await loginWithWallet(publicKey, username, message, signatureBase58);
   ```

### Backend (instinct-fi-api):

1. **Verify Signature**
   ```typescript
   import nacl from 'tweetnacl';
   import bs58 from 'bs58';
   import { PublicKey } from '@solana/web3.js';
   
   const publicKey = new PublicKey(walletAddress);
   const messageBytes = new TextEncoder().encode(message);
   const signatureBytes = bs58.decode(signature);
   
   const verified = nacl.sign.detached.verify(
     messageBytes,
     signatureBytes,
     publicKey.toBytes()
   );
   ```

2. **Create/Update User**
   ```typescript
   if (verified) {
     const user = await userService.createOrUpdateUser({
       walletAddress,
       username
     });
     // Return auth token
   }
   ```

---

## 🛠️ Common Issues & Solutions

### Issue 1: "Cannot read properties of undefined (reading 'toString')"

**Solution:** Different wallets return public keys differently:

```typescript
// Handle multiple formats
let publicKey: string;

if (response.publicKey?.toString) {
  publicKey = response.publicKey.toString();
} else if (response.publicKey?.toBase58) {
  publicKey = response.publicKey.toBase58();
} else if (provider.publicKey) {
  publicKey = provider.publicKey.toString();
}
```

### Issue 2: "Wallet not detected"

**Causes:**
- Wallet extension not installed
- Page not refreshed after installation
- Wallet locked

**Solution:**
```typescript
if (!provider) {
  throw new Error('Please install wallet and refresh the page');
}
```

### Issue 3: "Signature verification failed"

**Common causes:**
- Message encoding mismatch
- Signature format issue (Array vs Uint8Array)
- Wrong public key

**Solution:** Add extensive logging:
```typescript
console.log('Message:', message);
console.log('Signature:', signature);
console.log('Public Key:', publicKey);
```

---

## 🔄 Switching Networks

Currently using **Devnet**. To switch networks:

### In `WalletProvider.tsx`:

```typescript
// Current: Devnet
const network = WalletAdapterNetwork.Devnet;

// For Mainnet:
const network = WalletAdapterNetwork.Mainnet;

// For Testnet:
const network = WalletAdapterNetwork.Testnet;

// Custom RPC:
const endpoint = 'https://your-rpc-endpoint.com';
```

---

## 📚 Resources

### Official Documentation:
- **Solana Wallet Adapter**: https://github.com/anza-xyz/wallet-adapter
- **Solana Web3.js**: https://solana-labs.github.io/solana-web3.js/
- **Solana Cookbook**: https://solanacookbook.com/

### Wallet-Specific Docs:
- **Phantom**: https://docs.phantom.app/
- **Solflare**: https://docs.solflare.com/
- **Backpack**: https://docs.backpack.app/

### Testing:
- **Solana Devnet Faucet**: https://faucet.solana.com/
- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet

---

## 🎯 Quick Reference

### Add a New Wallet (3 Steps):

1. **Import adapter** in `WalletProvider.tsx`
2. **Add to wallets array** in `useMemo()`
3. **Add detection** in `LoginDialog.tsx` (optional)

### Files to Modify:
- `src/contexts/WalletProvider.tsx` - Provider setup
- `src/components/LoginDialog.tsx` - UI and connection logic
- `instinct-fi-api/src/controllers/AuthController.ts` - Backend verification

### Key Concepts:
- **Provider** = Window object injected by wallet extension
- **Adapter** = Standardized interface for each wallet
- **SignMessage** = Cryptographic proof of ownership
- **Base58** = Encoding format for Solana addresses/signatures

---

## 💡 Best Practices

1. ✅ **Always verify signatures on the backend** (never trust frontend)
2. ✅ **Handle multiple public key formats** (wallets differ)
3. ✅ **Add retry logic** for connection failures
4. ✅ **Show clear error messages** to users
5. ✅ **Test on both desktop and mobile**
6. ✅ **Use Devnet for development** (free SOL from faucet)
7. ✅ **Log extensively** during development
8. ✅ **Disconnect wallet** when user logs out

---

## 🚀 Next Steps

To add a new wallet:

```bash
# 1. Check if adapter exists
npm list @solana/wallet-adapter-wallets

# 2. If not, install
npm install @solana/wallet-adapter-wallets@latest

# 3. Import and add to WalletProvider.tsx
# 4. Test connection
# 5. Deploy!
```

**Happy coding! 🎉**


