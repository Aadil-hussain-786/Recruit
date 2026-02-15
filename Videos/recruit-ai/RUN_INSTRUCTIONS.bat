@echo off
echo.
echo ================================================
echo        Recruit-AI Application Setup Guide
echo ================================================
echo.
echo 1. FRONTEND STATUS:
echo    The frontend has been started in the background.
echo    It should be available at http://localhost:3000
echo    (May take 10-20 seconds to fully start)
echo.
echo 2. BACKEND SETUP REQUIRED:
echo    The backend requires MongoDB to run properly.
echo.
echo    INSTALLATION OPTIONS:
echo    Option A - Local MongoDB:
echo      - Download MongoDB Community Server from:
echo        https://www.mongodb.com/try/download/community
echo      - Install and start the MongoDB service
echo      - Then run: cd backend && npm run dev
echo.
echo    Option B - Cloud MongoDB (MongoDB Atlas):
echo      - Sign up at: https://www.mongodb.com/atlas
echo      - Create a free cluster
echo      - Update MONGO_URI in backend/.env with your connection string
echo      - Then run: cd backend && npm run dev
echo.
echo 3. PRISMA SETUP (after MongoDB is running):
echo    Run these commands in the backend directory:
echo      - npx prisma generate
echo      - npx prisma db push
echo.
echo Press any key to exit this information window...
echo ================================================
pause > nul