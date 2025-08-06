#!/bin/bash

echo "🚀 Starting AI Document Q&A System..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file and add your OpenAI API key before starting the application."
    echo "   You can get an API key from: https://platform.openai.com/api-keys"
    exit 1
fi

# Check if OpenAI API key is set
if grep -q "your_openai_api_key_here" .env; then
    echo "⚠️  Please set your OpenAI API key in the .env file"
    echo "   You can get an API key from: https://platform.openai.com/api-keys"
    exit 1
fi

# Check if JWT secret is set
if grep -q "your_jwt_secret_here" .env; then
    echo "⚠️  Please set your JWT secret in the .env file"
    echo "   You can generate a random string for this"
    exit 1
fi

echo "✅ Environment variables configured"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client && npm install && cd ..
fi

echo "🎯 Starting development servers..."
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📋 Sample document available: sample_document.txt"
echo "   You can upload this file to test the system"
echo ""

# Start both servers
npm run dev 