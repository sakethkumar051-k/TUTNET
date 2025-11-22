# Troubleshooting Admin Login 404 Error

## Quick Checks

### 1. Check Browser Console
Open browser DevTools (F12) → Console tab and look for:
- `API Base URL: ...` - Should show `https://tutnet-1.onrender.com/api`
- `API Request: POST ...` - Should show the full URL being called
- Any error messages

### 2. Check Network Tab
Open browser DevTools (F12) → Network tab:
- Find the `verify-admin` request
- Check the **Request URL** - Should be: `https://tutnet-1.onrender.com/api/auth/verify-admin`
- Check the **Status Code** - 404 means route not found, 401 means auth failed

### 3. Verify Vercel Environment Variable
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check `VITE_API_URL` is set to: `https://tutnet-1.onrender.com` (without `/api`)
3. Make sure it's set for **Production** environment
4. **Redeploy** after setting/changing the variable

### 4. Verify Backend is Running
Test the endpoint directly:
```bash
# Test login first (get a token)
curl -X POST https://tutnet-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Then test verify-admin with the token
curl -X POST https://tutnet-1.onrender.com/api/auth/verify-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"adminSecret":"your-secret"}'
```

## Common Issues

### Issue 1: Wrong URL Being Called
**Symptom**: Network tab shows request to `/auth/verify-admin` (without `/api`)

**Cause**: `VITE_API_URL` not set in Vercel, or Vercel hasn't redeployed

**Fix**:
1. Set `VITE_API_URL` = `https://tutnet-1.onrender.com` in Vercel
2. Redeploy Vercel application
3. Clear browser cache and hard refresh

### Issue 2: Route Not Found (404)
**Symptom**: Backend returns 404 for `/api/auth/verify-admin`

**Possible Causes**:
- Routes not loaded on backend
- Backend deployment failed
- Wrong endpoint path

**Fix**:
1. Check Render logs for "All routes loaded successfully"
2. Verify `server/routes/auth.routes.js` exists and exports router
3. Test endpoint directly with curl (see above)

### Issue 3: Token Not Being Sent
**Symptom**: 401 "Not authorized, no token"

**Cause**: Token not in localStorage or interceptor not working

**Fix**:
1. Check browser console for "Has token: true/false"
2. Check localStorage in DevTools → Application → Local Storage
3. Verify token is stored after login

### Issue 4: CORS Error
**Symptom**: CORS error in console

**Cause**: Frontend domain not in CORS whitelist

**Fix**:
1. Check `server/server.js` CORS configuration
2. Add your Vercel domain to allowed origins
3. Redeploy backend

## Step-by-Step Debugging

1. **Check Console Logs**
   - Open browser console
   - Look for API Base URL and request URLs
   - Note any errors

2. **Check Network Request**
   - Open Network tab
   - Try admin login
   - Click on the `verify-admin` request
   - Check:
     - Request URL (should include `/api`)
     - Request Headers (should have Authorization)
     - Response (what error message?)

3. **Verify Environment Variable**
   - Vercel Dashboard → Settings → Environment Variables
   - `VITE_API_URL` should be `https://tutnet-1.onrender.com`
   - Redeploy if changed

4. **Test Backend Directly**
   - Use curl or Postman to test the endpoint
   - Verify it works without frontend

5. **Check Backend Logs**
   - Render Dashboard → Your Service → Logs
   - Look for route loading messages
   - Check for any errors

## Expected Behavior

✅ **Success Flow**:
1. Login request → `POST /api/auth/login` → Returns token
2. Store token in localStorage
3. Verify-admin request → `POST /api/auth/verify-admin` → Returns `{verified: true}`
4. Redirect to admin dashboard

❌ **404 Error**:
- Request URL doesn't include `/api` prefix
- Backend route not registered
- Wrong endpoint path

## Still Not Working?

If you've checked everything above and still getting 404:

1. **Share the exact error from browser console**
2. **Share the Network tab details** (Request URL, Status, Response)
3. **Verify Vercel has redeployed** with latest code
4. **Check Render logs** for any route loading errors

