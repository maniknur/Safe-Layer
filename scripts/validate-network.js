#!/usr/bin/env node

/**
 * SafeLayer Pre-Deployment Network Validation
 *
 * Validates that the deployment target is BNB Testnet (chainId 97)
 * before allowing any contract deployment to proceed.
 *
 * Usage: node scripts/validate-network.js
 */

const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../smart-contracts/.env') });

const EXPECTED_CHAIN_ID = 97n;
const EXPECTED_NETWORK_NAME = 'BNB Smart Chain Testnet';

async function validateNetwork() {
  console.log('='.repeat(56));
  console.log('  SafeLayer — Pre-Deployment Network Validation');
  console.log('='.repeat(56));
  console.log();

  // --- Check env vars ---
  const rpcUrl = process.env.BNBTESTNET_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!rpcUrl) {
    console.error('[FAIL] BNBTESTNET_RPC_URL is not set in smart-contracts/.env');
    process.exit(1);
  }

  if (!privateKey) {
    console.error('[FAIL] DEPLOYER_PRIVATE_KEY is not set in smart-contracts/.env');
    process.exit(1);
  }

  // --- Connect to RPC ---
  console.log(`[....] Connecting to ${rpcUrl}`);

  let provider;
  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
  } catch (err) {
    console.error(`[FAIL] Could not create provider: ${err.message}`);
    process.exit(1);
  }

  // --- Fetch network info ---
  let network;
  try {
    network = await provider.getNetwork();
  } catch (err) {
    console.error(`[FAIL] Could not connect to RPC: ${err.message}`);
    process.exit(1);
  }

  const chainId = network.chainId;

  // --- Validate chainId ---
  if (chainId !== EXPECTED_CHAIN_ID) {
    console.error();
    console.error('!'.repeat(56));
    console.error('  DEPLOYMENT BLOCKED — WRONG NETWORK');
    console.error('!'.repeat(56));
    console.error();
    console.error(`  Expected chain ID : ${EXPECTED_CHAIN_ID} (BNB Testnet)`);
    console.error(`  Actual chain ID   : ${chainId}`);
    console.error();
    console.error('  Aborting to prevent accidental mainnet deployment.');
    console.error();
    process.exit(1);
  }

  // --- Fetch block number ---
  let blockNumber;
  try {
    blockNumber = await provider.getBlockNumber();
  } catch (err) {
    console.error(`[FAIL] Could not fetch block number: ${err.message}`);
    process.exit(1);
  }

  // --- Derive wallet address ---
  let wallet;
  try {
    wallet = new ethers.Wallet(privateKey, provider);
  } catch (err) {
    console.error(`[FAIL] Invalid DEPLOYER_PRIVATE_KEY: ${err.message}`);
    process.exit(1);
  }

  // --- Fetch balance ---
  let balance;
  try {
    balance = await provider.getBalance(wallet.address);
  } catch (err) {
    balance = null;
  }

  // --- Print results ---
  console.log(`[  OK] Connected successfully`);
  console.log();
  console.log('-'.repeat(56));
  console.log(`  Network        : ${EXPECTED_NETWORK_NAME}`);
  console.log(`  Chain ID       : ${chainId}`);
  console.log(`  Block Number   : ${blockNumber}`);
  console.log(`  RPC Endpoint   : ${rpcUrl}`);
  console.log('-'.repeat(56));
  console.log(`  Deployer Addr  : ${wallet.address}`);
  if (balance !== null) {
    console.log(`  Balance        : ${ethers.formatEther(balance)} BNB`);
    if (balance === 0n) {
      console.warn();
      console.warn('  [WARN] Deployer balance is 0 BNB.');
      console.warn('  Get testnet BNB: https://testnet.binance.org/faucet');
    }
  }
  console.log('-'.repeat(56));
  console.log();
  console.log('[  OK] Network validation passed. Safe to deploy.');
  console.log();
}

validateNetwork().catch((err) => {
  console.error(`[FAIL] Unexpected error: ${err.message}`);
  process.exit(1);
});
