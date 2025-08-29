@echo off
REM LumiChat Local Development Startup Script for Windows

echo 🚀 Starting LumiChat Development Environment...

REM Check if backend .env exists
if not exist "backend\.env" (
    echo ❌ Error: backend\.env file not found!
    echo Please create backend\.env with your GOOGLE_API_KEY
    pause
    exit /b 1
)

REM Start backend
echo 🔧 Starting backend server...
start /b cmd /c "cd backend && node index.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
echo 🎨 Starting frontend...
start /b cmd /c "npm run dev"

echo.
echo ✅ LumiChat is starting up!
echo 📱 Frontend: http://localhost:3001
echo 🔧 Backend: http://localhost:3002
echo.
echo Press any key to stop...
pause > nul
