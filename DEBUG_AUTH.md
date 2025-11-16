# 🔍 Debug Authentication - Check if User Data is Loading

## Current User in Backend

✅ **User exists in backend:**
```json
{
  "id": "cmhi14uso0000xc856nd4ba1t",
  "walletAddress": "HKsDC4heoyyVgxDyckDsZK214NfZUMtMJG7F9YU7KYgo",
  "username": "bagas",
  "xp": 0,
  "totalRuns": 0,
  "winRate": 0
}
```

---

## 🧪 Check Authentication Status

### **In Browser Console (http://localhost:8080/dashboard):**

Press `F12` or `Cmd+Option+I` to open DevTools, then run:

```javascript
// Check if user is logged in
localStorage.getItem('instinct_fi_token')
localStorage.getItem('instinct_fi_wallet')
localStorage.getItem('instinct_fi_username')

// Check auth context
window.authContext = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
```

---

## ✅ Expected Values

**If logged in:**
```javascript
instinct_fi_token: "eyJhbGc..." (JWT token)
instinct_fi_wallet: "HKsDC4heoyyVgxDyckDsZK214NfZUMtMJG7F9YU7KYgo"
instinct_fi_username: "bagas"
```

**If NOT logged in:**
```javascript
All values: null
```

---

## 🔧 If Not Logged In - Re-login

1. **Logout if needed:**
   - Click "Logout" button on Dashboard

2. **Login again:**
   - Go to: http://localhost:8080/
   - Click "Connect Wallet"
   - Select your wallet (Phantom)
   - Sign the message
   - Enter username: "bagas"
   - Click login

3. **Check username appears:**
   - Should see "• bagas" next to "Instinct.fi" title
   - Profile should show "bagas"

---

## 📊 What Should Happen

**After login:**
1. Frontend calls `/auth/wallet/verify`
2. Backend returns `{ user: {...}, token: "jwt..." }`
3. Frontend saves token to localStorage
4. Frontend saves user to AuthContext
5. Dashboard shows username
6. Profile shows full user data

---

## 🐛 Common Issues

### **Issue: Username not showing**
**Cause:** AuthContext not properly extracting user from response
**Fix:** Already updated to handle `response.data.user` vs `response.data`

### **Issue: Token not saved**
**Cause:** Not storing JWT token from backend
**Fix:** Already updated to save real token from backend

### **Issue: API calls failing**
**Cause:** Invalid or missing token
**Fix:** Check browser console for 401 errors

---

## 🧪 Test Now

1. **Open browser console** on http://localhost:8080/dashboard
2. **Run:** `localStorage.getItem('instinct_fi_username')`
3. **Should return:** `"bagas"`

If it returns `null`, you need to log in again!

**Quick re-login:**
- Logout → Login → Connect Wallet → Sign → Enter "bagas" → Done!

---

**Check your browser console and let me know what you see!** 🔍











