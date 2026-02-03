# Troubleshooting 500 Errors - Recruit AI

## Common 500 Error Causes and Solutions

### 1. Missing or Invalid GEMINI_API_KEY ⚠️

**Error Message:**
```json
{
  "success": false,
  "message": "AI service is not configured. Please set GEMINI_API_KEY in environment variables."
}
```

**Solution:**
1. Get your API key from: https://aistudio.google.com/app/apikey
2. Open `backend/.env`
3. Replace `your_gemini_api_key_here` with your actual key:
   ```env
   GEMINI_API_KEY=AIzaSyC...your_actual_key_here
   ```
4. Restart the server

### 2. Database Connection Issues

**Error Message:**
```json
{
  "success": false,
  "message": "Failed to create job",
  "error": "PrismaClientInitializationError..."
}
```

**Solution:**
1. Make sure MongoDB is running:
   ```bash
   # Check if MongoDB is running
   mongosh
   ```
2. Verify DATABASE_URL in `.env`:
   ```env
   DATABASE_URL="mongodb://localhost:27017/recruit-ai"
   ```
3. Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### 3. Authentication Issues

**Error Message:**
```
401 Unauthorized
```

**Solution:**
1. Make sure you're sending the JWT token in headers:
   ```
   Authorization: Bearer your_jwt_token_here
   ```
2. Check if token is expired (default: 30 days)
3. Try logging in again to get a fresh token

### 4. Missing Required Fields

**Error Message:**
```json
{
  "success": false,
  "message": "Title and description are required"
}
```

**Solution:**
Make sure your request includes all required fields:
```json
{
  "title": "Senior Developer",
  "description": "We are looking for...",
  "status": "DRAFT"
}
```

### 5. Gemini API Rate Limits

**Error Message:**
```json
{
  "success": false,
  "message": "Failed to generate job embeddings. Please check your Gemini API key.",
  "error": "429 Too Many Requests"
}
```

**Solution:**
1. Wait a few minutes before trying again
2. Check your API quota at: https://aistudio.google.com/app/apikey
3. Consider upgrading your API plan if needed

## Testing Job Creation

### Using cURL (PowerShell):
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
}

$body = @{
    title = "Senior Full Stack Developer"
    description = "We are looking for an experienced developer..."
    status = "DRAFT"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/jobs" -Method POST -Headers $headers -Body $body
```

### Using Postman:
1. **Method**: POST
2. **URL**: `http://localhost:5000/api/jobs`
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. **Body** (raw JSON):
   ```json
   {
     "title": "Senior Full Stack Developer",
     "description": "We are looking for an experienced developer with 5+ years of experience in React, Node.js, and MongoDB.",
     "status": "DRAFT"
   }
   ```

## Checking Server Logs

The server now provides detailed error messages. Look for:

1. **Console output** when running `npm run dev`
2. **Error messages** in the response body
3. **Stack traces** in the terminal

Example of helpful error output:
```
Job creation error: Error: [GoogleGenerativeAI Error]: API key not valid
```

## Environment Variables Checklist

Make sure your `.env` file has all of these:

```env
✅ PORT=5000
✅ MONGO_URI=mongodb://localhost:27017/recruit-ai
✅ JWT_SECRET=<your_secret>
✅ JWT_EXPIRE=30d
✅ JWT_REFRESH_SECRET=<your_refresh_secret>
✅ JWT_REFRESH_EXPIRE=7d
✅ NODE_ENV=development
✅ GEMINI_API_KEY=<your_actual_gemini_key>  ⚠️ MUST BE REAL KEY
✅ DATABASE_URL="mongodb://localhost:27017/recruit-ai"
```

## Quick Diagnostic Steps

1. **Check if server is running:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok","message":"Recruitment AI Backend is running"}`

2. **Check if you're authenticated:**
   - Try the `/api/auth/signin` endpoint first
   - Save the JWT token from the response

3. **Check if Gemini API key works:**
   - Test with the `/api/jobs/generate-jd` endpoint
   - This will validate your API key

4. **Check database connection:**
   - Run `mongosh` to verify MongoDB is running
   - Check if the database exists: `show dbs`

## Still Having Issues?

If you're still getting 500 errors:

1. **Check the exact error message** in the response body
2. **Look at the server console** for detailed stack traces
3. **Verify all environment variables** are set correctly
4. **Restart the server** after making any .env changes
5. **Check if MongoDB is running** and accessible

## Updated Error Responses

The application now returns more helpful error messages:

### Before:
```json
{
  "success": false,
  "message": "Server Error"
}
```

### After:
```json
{
  "success": false,
  "message": "Failed to generate job embeddings. Please check your Gemini API key.",
  "error": "API key not valid. Please pass a valid API key."
}
```

This makes debugging much easier! 🎉
