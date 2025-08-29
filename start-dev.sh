#!/bin/bash

# LumiChat Local Development Startup Script

echo "🚀 Starting LumiChat Development Environment..."

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "Please create backend/.env with your GOOGLE_API_KEY"
    exit 1
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
node index.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ LumiChat is starting up!"
echo "📱 Frontend: http://localhost:3001"
echo "🔧 Backend: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for user to stop
wait
