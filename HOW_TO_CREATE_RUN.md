# 🎮 How to Create a Run - Complete Guide

## 📋 Overview

Creating a run starts a new trading game that users can join. Here's how to do it!

---

## 🚀 Method 1: Using Command Line (Easiest)

### **Step 1: Get an Auth Token**

You need to be authenticated. Run this:

```bash
cd ~/Projects/instinctfi-backend
node scripts/wallet-auth-test.js
```

**Copy the token** from the output (starts with `eyJhbGc...`)

---

### **Step 2: Create the Run**

```bash
curl -X POST http://localhost:3001/api/v1/runs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tradingPair": "SOL/USDC",
    "coin": "SOL",
    "minDeposit": 10,
    "maxDeposit": 100,
    "duration": 120,
    "votingInterval": 10,
    "maxParticipants": 100
  }'
```

**Replace `YOUR_TOKEN_HERE`** with the token from Step 1!

---

### **Step 3: Verify Run Was Created**

```bash
curl http://localhost:3001/api/v1/runs/active | jq '.data[] | {id, status, countdown, tradingPair}'
```

You should see your new run with:
- ✅ Status: `WAITING`
- ✅ Countdown: ~600 seconds (10 minutes)
- ✅ Trading Pair: `SOL/USDC`

---

## 🎯 Method 2: Using a Script (Automated)

Create this handy script:

```bash
cd ~/Projects/instinctfi-backend
```

Create file: `scripts/create-run.sh`

```bash
#!/bin/bash

# Quick script to create a run
# Usage: ./scripts/create-run.sh

echo "🎮 Creating new trading run..."

# Get auth token
TOKEN=$(node scripts/wallet-auth-test.js 2>&1 | grep "Token:" | tail -1 | awk '{print $NF}')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token"
  exit 1
fi

echo "✅ Token obtained"

# Create run
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/runs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tradingPair": "SOL/USDC",
    "coin": "SOL",
    "minDeposit": 10,
    "maxDeposit": 100
  }')

echo "$RESPONSE" | jq '.'

RUN_ID=$(echo "$RESPONSE" | jq -r '.data.id')

if [ "$RUN_ID" != "null" ]; then
  echo ""
  echo "✅ Run created successfully!"
  echo "   Run ID: $RUN_ID"
  echo "   View at: http://localhost:8080/dashboard"
else
  echo "❌ Failed to create run"
fi
```

**Make it executable:**
```bash
chmod +x scripts/create-run.sh
```

**Run it:**
```bash
./scripts/create-run.sh
```

---

## 📝 Run Parameters Explained

### **Required Fields:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `tradingPair` | string | Trading pair to trade | `"SOL/USDC"` |
| `coin` | string | Base coin | `"SOL"` |

### **Optional Fields (with defaults):**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `minDeposit` | number | 10 | Min USDC per user |
| `maxDeposit` | number | 100 | Max USDC per user |
| `duration` | number | 120 | Run duration (minutes) |
| `votingInterval` | number | 10 | Vote frequency (minutes) |
| `maxParticipants` | number | 100 | Max players |

---

## 🎯 Examples

### **Standard Run (Default Settings)**

```bash
curl -X POST http://localhost:3001/api/v1/runs \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tradingPair": "SOL/USDC",
    "coin": "SOL"
  }'
```

**Result:**
- Min deposit: 10 USDC
- Max deposit: 100 USDC
- Duration: 2 hours
- Voting: Every 10 minutes
- Max players: 100

---

### **Custom Run (VIP Room)**

```bash
curl -X POST http://localhost:3001/api/v1/runs \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tradingPair": "SOL/USDC",
    "coin": "SOL",
    "minDeposit": 50,
    "maxDeposit": 500,
    "maxParticipants": 20
  }'
```

**Result:**
- Min deposit: 50 USDC (higher barrier)
- Max deposit: 500 USDC (whales welcome)
- Max players: 20 (exclusive)

---

### **Quick Run (Fast Paced)**

```bash
curl -X POST http://localhost:3001/api/v1/runs \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tradingPair": "SOL/USDC",
    "coin": "SOL",
    "duration": 60,
    "votingInterval": 5
  }'
```

**Result:**
- Duration: 1 hour (instead of 2)
- Voting: Every 5 minutes (instead of 10)
- More rounds, faster pace

---

## ⏱️ **What Happens After Creation**

### **Timeline:**

```
t=0:00  → Run created (Status: WAITING)
         Lobby phase begins
         Countdown: 10:00

t=10:00 → Lobby ends
         If participants > 0: Status → ACTIVE ✅
         If participants = 0: Status → ENDED ❌

t=10:00 → First voting round opens
to       Trading begins
t=130:00  12 rounds of voting/trading

t=130:00 → Run ends (Status: SETTLING)
          P/L calculated
          Funds distributed
```

---

## 🔍 **Check Your Run**

### **View All Active Runs:**
```bash
curl http://localhost:3001/api/v1/runs/active | jq '.data'
```

### **View Specific Run:**
```bash
curl http://localhost:3001/api/v1/runs/RUN_ID | jq '.data'
```

### **View on Frontend:**
```
http://localhost:8080/dashboard
```

---

## 🎨 **Frontend Display**

After creating a run, users will see on Dashboard:

```
┌──────────────────────────────────────┐
│ 🎮 Run #cmhi...                     │
│ Status: WAITING                      │
│                                      │
│ Trading SOL/USDC                     │
│                                      │
│ Total Pool: 0 USDC                   │
│ Players: 0 / 100                     │
│                                      │
│ ⏰ Lobby Ends In      09:45         │
│                                      │
│ Run starts automatically in 9 min    │
│ 45 sec                               │
│                                      │
│ ⚠️ Run will be canceled if no one    │
│ joins                                │
│                                      │
│ [Join Run →]                         │
└──────────────────────────────────────┘
```

---

## 🛠 **Advanced: Create Run via Script**

Create: `~/Projects/instinctfi-backend/scripts/create-run-quick.js`

```javascript
#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function createRun() {
  try {
    // Get token
    const { stdout: tokenOutput } = await execPromise(
      'node scripts/wallet-auth-test.js 2>&1 | grep "Token:" | tail -1'
    );
    const token = tokenOutput.split('Token:')[1]?.trim();
    
    if (!token) throw new Error('Failed to get token');
    
    // Create run
    const { stdout } = await execPromise(`
      curl -s -X POST http://localhost:3001/api/v1/runs \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d '{"tradingPair":"SOL/USDC","coin":"SOL"}'
    `);
    
    const result = JSON.parse(stdout);
    
    if (result.success) {
      console.log('✅ Run created!');
      console.log('   ID:', result.data.id);
      console.log('   Countdown:', result.data.countdown, 'seconds');
      console.log('\n🌐 View at: http://localhost:8080/dashboard');
    } else {
      console.error('❌ Failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createRun();
```

**Run it:**
```bash
chmod +x scripts/create-run-quick.js
node scripts/create-run-quick.js
```

---

## 📊 **Run Lifecycle**

```
CREATE
  ↓
WAITING (Lobby - 10 min)
  ├─ Users deposit USDC
  └─ Countdown ticks
  ↓
ACTIVE (Trading - 2 hours)
  ├─ 12 voting rounds
  ├─ Vote every 10 min
  └─ Trades executed
  ↓
SETTLING (Calculate P/L)
  ├─ Platform takes 15% fee
  └─ Distribute shares
  ↓
ENDED (Complete)
  └─ Users can withdraw
```

---

## ✅ **Quick Command Reference**

```bash
# Create run (default settings)
curl -X POST http://localhost:3001/api/v1/runs \
  -H "Authorization: Bearer TOKEN" \
  -d '{"tradingPair":"SOL/USDC","coin":"SOL"}'

# View active runs
curl http://localhost:3001/api/v1/runs/active | jq '.'

# View specific run
curl http://localhost:3001/api/v1/runs/RUN_ID | jq '.'
```

---

**Try creating a run now and watch it appear on your Dashboard!** 🚀











