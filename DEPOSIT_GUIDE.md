# 💰 USDC Deposit Guide

## ✅ What's New

A **Deposit** button has been added to the Dashboard, right next to the Profile button!

This allows users to deposit USDC from their Solana wallet to join runs on-chain.

---

## 🎯 How to Use

### 1. **View the Deposit Button**

Open the Dashboard: http://localhost:8082/dashboard

You'll see:
```
[Deposit] [Profile] [Logout]
```

### 2. **Click Deposit**

A dialog will open showing:
- Your wallet address
- Your USDC balance
- Your SOL balance (for gas fees)
- Deposit amount input
- Quick amount buttons (10, 25, 50, 100)

### 3. **Enter Amount**

- Min: 10 USDC (adjusts based on run settings)
- Max: 100 USDC (adjusts based on run settings)
- Or click quick amount buttons

### 4. **Confirm Deposit**

Click **"Deposit X USDC"** button to:
1. Transfer USDC from your wallet
2. Send to run vault PDA on Solana
3. Confirm transaction on-chain
4. Show success notification with transaction link

---

## 🧪 Testing on Devnet

### **Step 1: Get Devnet SOL**

You need SOL for transaction fees:

```bash
# Airdrop 2 SOL to your wallet
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```

Or use: https://faucet.solana.com/

### **Step 2: Get Test USDC**

You need test USDC tokens. Run this script:

```bash
cd ~/Projects/instinct-chaotic-learn
node scripts/get-test-usdc.js <YOUR_WALLET_ADDRESS> <AMOUNT>
```

Example:
```bash
node scripts/get-test-usdc.js 2f2GzFzxrvqQ2E8pAt7EVwq6YWcuZqegA5HBge7qiCfn 100
```

This will mint 100 test USDC to your wallet.

### **Step 3: Test Deposit**

1. Open frontend: http://localhost:8082/dashboard
2. Click **Deposit** button
3. Enter amount (e.g., 50 USDC)
4. Click **Deposit 50 USDC**
5. Approve transaction in your wallet (Phantom/Solflare)
6. Wait for confirmation
7. ✅ Success! View transaction on explorer

---

## 🔗 Integration Details

### **Solana Program**
- **Program ID:** `7gmTYKqNX4xKsrd6NfNRscL3XSUoUTQyyTPhySWoABUc`
- **Network:** Devnet
- **USDC Mint:** `4S3JAFSr7HZg4T8WFPPhXs2HsSz8TyEhEyURVQUxHE5Y`

### **How It Works**

1. User clicks Deposit
2. Frontend derives run vault PDA
3. Creates SPL token transfer instruction
4. Transfers USDC from user → run vault
5. Transaction sent to Solana devnet
6. User can verify on Solana Explorer

### **PDA Derivation**

```typescript
// Run Vault PDA
seeds = ['vault', run_id (u64 little-endian)]
```

---

## 📊 Features

✅ **Real-time Balance Display**
- Shows USDC balance
- Shows SOL balance
- Auto-refreshes after deposit

✅ **Input Validation**
- Min/max amount enforcement
- Balance checking
- SOL gas fee warning

✅ **Quick Amounts**
- Preset buttons: 10, 25, 50, 100 USDC
- One-click deposit amounts

✅ **Transaction Tracking**
- Loading states
- Success/error notifications
- Explorer link in toast

✅ **Wallet Integration**
- Connect wallet prompt if not connected
- Supports Phantom, Solflare
- Auto-fetches balances

---

## 🎨 UI/UX

**Button Style:**
- Gradient primary color
- Positioned before Profile button
- Icon: Arrow down (deposit symbol)

**Dialog Features:**
- Wallet info display
- Balance preview
- Amount input with USDC suffix
- Quick preset buttons
- Clear error messages
- Transaction confirmation toasts

---

## 🚀 Production Checklist

Before deploying to mainnet:

- [ ] Update `USDC_MINT_DEVNET` to mainnet USDC mint
- [ ] Update `SOLANA_PROGRAM_ID` to mainnet program ID
- [ ] Change WalletProvider network to mainnet-beta
- [ ] Update explorer URLs to mainnet
- [ ] Test with real funds (small amounts first!)
- [ ] Add slippage/priority fee settings

---

## 🛠 Troubleshooting

### "You don't have any USDC"
→ Get test USDC using `scripts/get-test-usdc.js`

### "Insufficient SOL for gas"
→ Get devnet SOL from https://faucet.solana.com/

### "Token account not found"
→ Need to create USDC token account first (handled automatically)

### "Transaction failed"
→ Check Solana Explorer link for details
→ Ensure run vault exists on-chain
→ Verify program is deployed

---

## 📝 Next Steps

After depositing:
1. Backend records your deposit in database
2. You're marked as a run participant
3. You can join the game when it starts
4. Vote on trading decisions
5. Share in the final P/L

---

**Happy Trading! 🎮**














