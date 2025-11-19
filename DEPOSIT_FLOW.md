# 💰 Deposit Flow - How It Works

Based on InstinctFi PRD specifications

---

## 🎯 Correct Deposit Architecture

### **User Deposit Flow:**

```
1. User clicks "Deposit" on Dashboard
   ↓
2. Enter amount (10-100 USDC)
   ↓
3. Sign transaction in wallet
   ↓
4. USDC transferred: User Wallet → Run Vault PDA (on-chain)
   ↓
5. Backend records deposit in database
   ↓
6. User marked as participant for this run
```

---

## 🏦 **The "Single Community Wallet" Explained

**PRD says:** "All deposits pooled into a single community wallet"

**What this means:**

1. **Deposit Phase:**
   - User USDC → Run Vault PDA (Solana program account)
   - Funds are **locked on-chain** and secure
   - Each run has its own vault (for accounting clarity)

2. **Trading Phase:**
   - Backend **Platform Drift Wallet** executes trades
   - This is the "single community wallet" that trades
   - All participants share the same trades/outcomes
   - Trades execute on Drift Protocol

3. **Settlement Phase:**
   - Backend calculates final P/L
   - Settles the run vault with updated balances
   - Platform takes 15% fee from profits only

4. **Withdrawal Phase:**
   - Users withdraw their share from run vault
   - Proportional to deposit + P/L share

---

## 📊 Example (50 USDC Deposit):

**Your deposit:**
```
Your Wallet (HKsD...KYgo)
    ↓ 50 USDC
Run Vault PDA (BCY...XiQ)
```

**Backend trading:**
```
Platform Drift Wallet (2f2G...cfn)
    ↓ Executes trades
Drift Protocol
```

**After run (+10% profit):**
```
Run Vault: 50 USDC → 55 USDC (your share)
Platform fee: -0.75 USDC (15% of 5 USDC profit)
Your withdrawal: 54.25 USDC
```

---

## ✅ Why Per-Run Vaults?

Even though trades happen via a "single community wallet" (Drift), using per-run vaults provides:

1. ✅ **Clear accounting** - Easy to track each run's funds
2. ✅ **Security** - Funds isolated per run
3. ✅ **Transparency** - Users can verify on-chain
4. ✅ **Auditability** - Each run is self-contained
5. ✅ **Parallel runs** - Multiple runs can happen simultaneously

**The "community" aspect = Everyone shares the same trades/outcomes, not the same vault**

---

## 🔧 Current Setup Matches PRD:

| PRD Requirement | Implementation | Status |
|-----------------|----------------|--------|
| Min 10 USDC | ✅ Frontend validates | ✅ |
| Max 100 USDC | ✅ Frontend validates | ✅ |
| Max 100 participants | ✅ Backend enforces | ✅ |
| Single community trading | ✅ Backend Drift wallet | ✅ |
| Proportional shares | ✅ Settlement logic | ✅ |
| 15% profit fee | ✅ Platform fee | ✅ |
| On-chain deposits | ✅ Solana program | ✅ |

---

## 🎮 Complete Flow Summary:

**Deposit:**
- ✅ User → Run Vault (on-chain, secure)

**Trading:**
- ✅ Backend Platform Wallet → Drift (the "community wallet")
- ✅ All participants share outcomes

**Settlement:**
- ✅ Backend calculates P/L per user
- ✅ Updates run vault balances
- ✅ Takes 15% platform fee from profits

**Withdrawal:**
- ✅ Users withdraw from run vault
- ✅ Get proportional share of final pool

---

**Your architecture is correct! The deposit dialog just needs the right USDC mint.** 🎉














