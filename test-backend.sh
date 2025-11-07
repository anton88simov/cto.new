#!/bin/bash

echo "==================================="
echo "Testing Backend API"
echo "==================================="
echo ""

# Start backend in background
echo "Starting backend server..."
npm run dev:backend > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Waiting for backend to start..."
sleep 5

# Test health endpoint
echo ""
echo "1. Testing health endpoint..."
response=$(curl -s http://localhost:3001/health)
if [ $? -eq 0 ]; then
    echo "✓ Health check successful"
    echo "  Response: $response"
else
    echo "✗ Health check failed"
fi

# Test settings endpoint
echo ""
echo "2. Testing settings endpoint..."
response=$(curl -s http://localhost:3001/api/settings)
if [ $? -eq 0 ]; then
    echo "✓ Settings endpoint accessible"
    echo "  Response: $response"
else
    echo "✗ Settings endpoint failed"
fi

# Test command validation
echo ""
echo "3. Testing command validation..."
response=$(curl -s -X POST http://localhost:3001/api/security/validate-command \
  -H "Content-Type: application/json" \
  -d '{"command": "ls -la"}')
if [ $? -eq 0 ]; then
    echo "✓ Command validation working"
    echo "  Response: $response"
else
    echo "✗ Command validation failed"
fi

# Test dangerous command
echo ""
echo "4. Testing dangerous command detection..."
response=$(curl -s -X POST http://localhost:3001/api/security/validate-command \
  -H "Content-Type: application/json" \
  -d '{"command": "rm -rf /"}')
if [ $? -eq 0 ]; then
    echo "✓ Dangerous command detection working"
    echo "  Response: $response"
else
    echo "✗ Dangerous command detection failed"
fi

echo ""
echo "==================================="
echo "Backend tests complete!"
echo "==================================="
echo ""
echo "Backend is running on PID $BACKEND_PID"
echo "To stop: kill $BACKEND_PID"
echo ""
echo "Backend logs: tail -f /tmp/backend.log"
echo "To test full app: npm run dev"
