# 💰 Deposit Feature - Quick Start

## ✅ What Was Added

A **Deposit** button on the Dashboard that allows users to deposit USDC to join runs!

**Location:** Dashboard → Top right (before Profile button)

---

## 🚀 Quick Test (3 Steps)

### 1️⃣ **Get Test USDC**

```bash
cd ~/Projects/instinct-chaotic-learn

# Mint 100 test USDC to your wallet
node scripts/get-test-usdc.js YOUR_WALLET_ADDRESS 100
```

### 2️⃣ **Open Frontend**

```bash
# Frontend is running at:
http://localhost:8082/dashboard
```

### 3️⃣ **Test Deposit**

1. Click **Deposit** button (green button with down arrow)
2. Connect wallet if not connected
3. View your USDC balance
4. Enter amount (e.g., 50)
5. Click **Deposit 50 USDC**
6. Approve in wallet
7. ✅ Done! See transaction on Solana Explorer

---

## 🎨 UI Features

**Deposit Dialog includes:**
- 💰 Real-time wallet balances (USDC & SOL)
- 🎯 Min/max validation
- ⚡ Quick amount buttons (10, 25, 50, 100)
- 🔗 Transaction explorer links
- ⚠️ Warning if no USDC balance
- 📱 Mobile responsive

---

## 🔧 Configuration

**Test USDC Mint (Devnet):**
```
4S3JAFSr7HZg4T8WFPPhXs2HsSz8TyEhEyURVQUxHE5Y
```

**Solana Program:**
```
7gmTYKqNX4xKsrd6NfNRscL3XSUoUTQyyTPhySWoABUc
```

**Network:** Devnet (for testing)

---

## 📝 Files Added

1. **`src/components/DepositDialog.tsx`** - Main deposit component
2. **`scripts/get-test-usdc.js`** - Helper to mint test USDC
3. **`DEPOSIT_GUIDE.md`** - Full documentation
4. **`DEPOSIT_QUICKSTART.md`** - This quick reference

---

## 🎯 What Happens on Deposit

```
User clicks Deposit
    ↓
Enter amount (10-100 USDC)
    ↓
Wallet signs transaction
    ↓
USDC transferred to Run Vault PDA
    ↓
Transaction confirmed on Solana
    ↓
User joins the run! 🎉
```

---

## ⚡ Quick Commands

```bash
# Get test USDC
node scripts/get-test-usdc.js YOUR_WALLET 100

# Check USDC balance
spl-token balance 4S3JAFSr7HZg4T8WFPPhXs2HsSz8TyEhEyURVQUxHE5Y --url devnet

# View on frontend
open http://localhost:8082/dashboard
```

---

**Ready to test! 🚀**














