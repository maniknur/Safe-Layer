/**
 * Block Watcher Service
 *
 * Monitors BNB Chain blocks for new contract deployments in real-time.
 * Uses WebSocket provider with automatic fallback to JSON-RPC polling.
 */

import { ethers } from 'ethers';

const WSS_URL = process.env.BNB_WSS_URL || 'wss://bsc-testnet.publicnode.com';
const RPC_URL = process.env.BNB_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';

export interface DeploymentEvent {
  contractAddress: string;
  deployer: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}

type DeploymentCallback = (event: DeploymentEvent) => void;

export class BlockWatcherService {
  private wsProvider: ethers.WebSocketProvider | null = null;
  private rpcProvider: ethers.JsonRpcProvider | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastProcessedBlock = 0;
  private listeners: DeploymentCallback[] = [];
  private running = false;

  /** Register a callback for newly discovered contract deployments */
  onDeployment(cb: DeploymentCallback): void {
    this.listeners.push(cb);
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      // Try WebSocket first for real-time block events
      this.wsProvider = new ethers.WebSocketProvider(WSS_URL);
      await this.wsProvider.getBlockNumber(); // test connection
      this.wsProvider.on('block', (blockNumber: number) => {
        this.processBlock(blockNumber).catch((err) =>
          console.error(`[BlockWatcher] Error on block ${blockNumber}:`, err)
        );
      });
      console.log('[BlockWatcher] Connected via WebSocket at', WSS_URL);
    } catch {
      // Fallback to polling every 3 seconds
      console.log('[BlockWatcher] WebSocket unavailable, falling back to polling');
      this.wsProvider = null;
      this.rpcProvider = new ethers.JsonRpcProvider(RPC_URL);
      this.pollInterval = setInterval(() => this.pollNewBlocks(), 3000);
    }
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.wsProvider) {
      await this.wsProvider.destroy();
      this.wsProvider = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    console.log('[BlockWatcher] Stopped');
  }

  private async pollNewBlocks(): Promise<void> {
    if (!this.rpcProvider) return;

    try {
      const latest = await this.rpcProvider.getBlockNumber();

      // Initialize to current block on first run
      if (this.lastProcessedBlock === 0) {
        this.lastProcessedBlock = latest - 1;
      }

      for (let i = this.lastProcessedBlock + 1; i <= latest; i++) {
        await this.processBlock(i);
      }
    } catch (err) {
      console.error('[BlockWatcher] Poll error:', err);
    }
  }

  private async processBlock(blockNumber: number): Promise<void> {
    if (blockNumber <= this.lastProcessedBlock) return;
    this.lastProcessedBlock = blockNumber;

    const provider = this.wsProvider || this.rpcProvider;
    if (!provider) return;

    try {
      const block = await provider.getBlock(blockNumber, true);
      if (!block || !block.prefetchedTransactions) return;

      for (const tx of block.prefetchedTransactions) {
        // Contract creation: tx.to is null
        if (tx.to === null) {
          const receipt = await provider.getTransactionReceipt(tx.hash);
          if (receipt?.contractAddress) {
            const event: DeploymentEvent = {
              contractAddress: receipt.contractAddress,
              deployer: tx.from,
              txHash: tx.hash,
              blockNumber,
              timestamp: block.timestamp,
            };

            for (const cb of this.listeners) {
              try {
                cb(event);
              } catch (err) {
                console.error('[BlockWatcher] Listener error:', err);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`[BlockWatcher] Error processing block ${blockNumber}:`, err);
    }
  }
}
