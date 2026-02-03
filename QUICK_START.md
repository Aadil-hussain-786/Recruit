# Quick Start Guide - Gemini AI Setup

## ⚡ Quick Setup (3 Steps)

### Step 1: Get Your Gemini API Key
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 2: Update .env File
Open `backend/.env` and replace the placeholder:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Step 3: Start the Server
```bash
cd backend
npm run dev
```

## ✅ What's Been Updated

All these services now use Gemini AI:

1. **Job Description Generation** - `aiService.ts`
2. **Resume Parsing** - `aiService.ts`
3. **Bias Detection** - `aiService.ts`
4. **Assessment Quiz Generation** - `assessmentService.ts`
5. **Chatbot Responses** - `chatbotService.ts`
6. **Communication Suggestions** - `communicationService.ts`

## 🧪 Test the Changes

### Test Job Description Generation
```bash
POST http://localhost:5000/api/jobs/generate-jd
Content-Type: application/json

{
  "role": "Senior Full Stack Developer",
  "seniority": "Senior",
  "keySkills": ["React", "Node.js", "TypeScript", "MongoDB"],
  "tone": "professional"
}
```

### Test Chatbot
```bash
POST http://localhost:5000/api/chatbot/message
Content-Type: application/json

{
  "message": "What is the interview process?",
  "context": {}
}
```

### Test Assessment Generation
```bash
POST http://localhost:5000/api/assessments/generate
Content-Type: application/json

{
  "role": "Frontend Developer",
  "skills": ["React", "JavaScript", "CSS"],
  "difficulty": "medium"
}
```

## 🔍 Verify Everything Works

After starting the server, you should see:
- ✅ No errors about missing API keys
- ✅ Server running on port 5000
- ✅ All routes responding correctly

## 🚨 Common Issues

### Issue: "API key not valid"
**Solution**: Make sure you copied the entire API key without spaces

### Issue: "GEMINI_API_KEY is not defined"
**Solution**: Restart the server after updating .env file

### Issue: "Rate limit exceeded"
**Solution**: Gemini has rate limits. Wait a moment and try again, or upgrade your API quota

## 📊 Model Information

**Current Model**: `gemini-1.5-flash`
- Fast response times
- Cost-effective
- Great for production use

**Alternative Models** (if needed):
- `gemini-1.5-pro` - More powerful, slower, more expensive
- `gemini-1.0-pro` - Older version, still reliable

To change the model, update the model name in each service file:
```typescript
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

## 🎉 You're All Set!

Your Recruit AI application is now fully powered by Google Gemini AI!
