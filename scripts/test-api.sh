#!/bin/bash

# SafeLayer BNB - Quick API Test Script
# Tests all endpoints with curl commands

set -e

BACKEND_URL="${1:-http://localhost:3001}"
echo "🧪 SafeLayer BNB API Test"
echo "Backend URL: $BACKEND_URL"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "Response: $body"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "HTTP Code: $http_code"
fi
echo ""

# Test 2: Analyze Risk - Valid Address
echo "2️⃣  Testing Risk Analysis (Valid Address)..."
address="0x1234567890123456789012345678901234567890"
response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/risk/$address")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "Address: $address"
    
    # Extract key fields
    risk_score=$(echo "$body" | grep -o '"riskScore":[0-9]*' | head -1 | cut -d: -f2)
    risk_level=$(echo "$body" | grep -o '"riskLevel":"[^"]*' | head -1 | cut -d'"' -f4)
    
    echo "Risk Score: $risk_score"
    echo "Risk Level: $risk_level"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "HTTP Code: $http_code"
    echo "Response: $body"
fi
echo ""

# Test 3: Invalid Address
echo "3️⃣  Testing Error Handling (Invalid Address)..."
response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/risk/invalid-address")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "400" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "Response: $body"
else
    echo -e "${RED}✗ FAIL${NC} (Expected 400, got $http_code)"
fi
echo ""

# Test 4: Another Valid Address
echo "4️⃣  Testing Another Address..."
address2="0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/risk/$address2")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    
    risk_score=$(echo "$body" | grep -o '"riskScore":[0-9]*' | head -1 | cut -d: -f2)
    risk_level=$(echo "$body" | grep -o '"riskLevel":"[^"]*' | head -1 | cut -d'"' -f4)
    
    echo "Risk Score: $risk_score"
    echo "Risk Level: $risk_level"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "HTTP Code: $http_code"
fi
echo ""

echo "=============================="
echo "✅ API Tests Complete!"
echo ""
echo "💡 Next Steps:"
echo "  - Visit http://localhost:3000 for the web interface"
echo "  - Check logs: docker-compose logs -f backend"
echo "  - Read API docs: README.md → API.md"
