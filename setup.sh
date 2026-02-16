#!/bin/bash

# SafeLayer BNB - One-Command Setup
# Run: bash setup.sh

set -e

echo "🚀 SafeLayer BNB Setup"
echo "====================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js: $(node -v)"

# Install backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create env files if they don't exist
echo ""
echo "🔧 Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    echo "✓ Creating backend/.env"
    cat > backend/.env << 'EOF'
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
EOF
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "✓ Creating frontend/.env.local"
    cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
EOF
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo ""
echo "Terminal 1 - Start backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 - Start frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "💡 Tip: Use 'docker-compose up' for easier setup with Docker!"
