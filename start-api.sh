#!/usr/bin/env bash

# Quick start script for HelpTheWeb API Server

echo "🚀 Starting HelpTheWeb Accessibility API Server..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Start the server
echo "✨ Starting API server on port 3000..."
echo "📍 Health check: http://localhost:3000/health"
echo "📍 API docs: http://localhost:3000/api/v1"
echo ""

node src/api/index.js
