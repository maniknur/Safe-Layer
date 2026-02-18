/**
 * Monitor Blocks Tool
 *
 * Scans recent BNB Chain blocks for new contract deployments.
 * Detects contract creation transactions (tx.to === null) and
 * returns the deployed contract addresses with metadata.
 */

import { ethers } from 'ethers';
import type { PluginAPI } from '../index';

const RPC_URL = process.env.BNB_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';

// Buffer of recently discovered contract deployments
let discoveredContracts: Array<{
  address: string;
  deployer: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}> = [];

interface MonitorParams {
  blocksBack?: number;
  flush?: boolean;
}

export function registerMonitorBlocksTool(api: PluginAPI): void {
  api.registerTool({
    name: 'bnb_monitor_blocks',
    description:
      'Scans recent BNB Chain blocks for new contract deployments. ' +
      'Returns addresses of newly deployed contracts with deployer info and tx hash. ' +
      'Call periodically to discover new contracts for risk analysis.',
    parameters: {
      type: 'object',
      properties: {
        blocksBack: {
          type: 'number',
          description: 'Number of recent blocks to scan (default: 5, max: 20)',
        },
        flush: {
          type: 'boolean',
          description: 'If true, clears the discovered buffer after returning results',
        },
      },
    },
    async execute(_id: string, params: Record<string, unknown>) {
      const { blocksBack: rawBlocks, flush } = params as unknown as MonitorParams;
      const blocksBack = Math.min(Math.max(rawBlocks || 5, 1), 20);

      const provider = new ethers.JsonRpcProvider(RPC_URL);

      try {
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = currentBlock - blocksBack + 1;
        const newContracts: typeof discoveredContracts = [];

        for (let i = fromBlock; i <= currentBlock; i++) {
          const block = await provider.getBlock(i, true);
          if (!block || !block.prefetchedTransactions) continue;

          for (const tx of block.prefetchedTransactions) {
            // Contract creation: tx.to is null
            if (tx.to === null) {
              const receipt = await provider.getTransactionReceipt(tx.hash);
              if (receipt?.contractAddress) {
                newContracts.push({
                  address: receipt.contractAddress,
                  deployer: tx.from,
                  txHash: tx.hash,
                  blockNumber: i,
                  timestamp: block.timestamp,
                });
              }
            }
          }
        }

        discoveredContracts.push(...newContracts);

        const result = {
          scannedBlocks: blocksBack,
          fromBlock,
          toBlock: currentBlock,
          newDeployments: newContracts.length,
          contracts: newContracts,
          bufferedTotal: discoveredContracts.length,
        };

        if (flush) {
          discoveredContracts = [];
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
        };
      }
    },
  });
}
