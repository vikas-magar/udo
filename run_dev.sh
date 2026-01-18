#!/bin/bash

# Define default keys for development
export UDO_ADMIN_KEY="admin-secret"
export UDO_VIEWER_KEY="viewer-secret"

# Start Backend Server
echo "Starting Backend Server on port 8080..."
cargo run --all-features -- server &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# Start Frontend
echo "Starting Web UI on port 3000..."
cd web
npm install
npm run dev &
FRONTEND_PID=$!

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
