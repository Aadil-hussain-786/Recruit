@echo off
title Recruit-AI Application Starter

echo Starting Recruit-AI Application...
echo.

REM Start the frontend in a separate window
echo Starting frontend...
start "Recruit-AI Frontend" cmd /k "cd /d "%~dp0frontend" && npx next dev"

echo.
echo Frontend started in a new window.
echo.

echo IMPORTANT: The backend requires MongoDB to be installed and running.
echo.
echo To run the backend, please:
echo 1. Install MongoDB Community Server from https://www.mongodb.com/try/download/community
echo 2. Start the MongoDB service
echo 3. Then run: cd backend && npm run dev in a separate command prompt
echo.
echo Alternatively, you can use MongoDB Atlas (cloud database):
echo 1. Sign up at https://www.mongodb.com/atlas
echo 2. Create a free cluster
echo 3. Update MONGO_URI in backend/.env with your Atlas connection string
echo.
echo Frontend should be available at http://localhost:3000 after it finishes loading
echo.

pause