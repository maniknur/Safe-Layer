#!/bin/bash

# SafeLayerRegistry Quick Setup Script
# This script sets up the development environment for deployment

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        SafeLayerRegistry - Quick Setup                    ║"
echo "║        On-Chain Risk Proof Registry for SafeLayer        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "✓ Checking environment..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js is not installed"
    echo "  Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "  Node.js: $NODE_VERSION"

NPM_VERSION=$(npm -v)
echo "  npm: $NPM_VERSION"

# Check if .env exists
echo ""
echo "✓ Checking configuration..."
if [ ! -f .env ]; then
    echo "  Creating .env from .env.example..."
    cp .env.example .env
    echo "  ⚠ Edit .env with your private key and API keys"
else
    echo "  .env found"
fi

# Install dependencies
echo ""
echo "✓ Installing dependencies..."
npm install --legacy-peer-deps

# Compile contract
echo ""
echo "✓ Compiling Solidity contract..."
npm run compile

# Show next steps
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   Setup Complete!                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Configure your credentials:"
echo "   Edit .env file with:"
echo "   - DEPLOYER_PRIVATE_KEY (your wallet private key)"
echo "   - BSCSCAN_API_KEY (from https://bscscan.com/apis)"
echo ""
echo "2️⃣  Get testnet BNB:"
echo "   https://testnet.binance.org/faucet"
echo ""
echo "3️⃣  Deploy the contract:"
echo "   npm run deploy:testnet"
echo ""
echo "4️⃣  Verify on BscScan:"
echo "   npm run verify:testnet"
echo ""
echo "5️⃣  Read the documentation:"
echo "   - DEPLOYMENT.md : Step-by-step deployment guide"
echo "   - README.md     : Complete project documentation"
echo "   - HACKATHON.md  : Hackathon submission guide"
echo ""
echo "📚 Integration Guide:"
echo "   See scripts/backend-integration.js for backend examples"
echo ""
echo "🔗 Useful Links:"
echo "   - BscScan Testnet: https://testnet.bscscan.com"
echo "   - BscScan Mainnet: https://bscscan.com"
echo "   - Contract Code: ./contracts/SafeLayerRegistry.sol"
echo ""
echo "❓ Questions?"
echo "   Check DEPLOYMENT.md Troubleshooting section"
echo ""
