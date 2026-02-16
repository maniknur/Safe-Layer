/**
 * Liquidity Analyzer Module
 * Analyzes liquidity-related risks using real BNB Chain data
 */

import { ethers } from 'ethers';
import logger from '../../utils/logger';

const RPC_URL = process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org/';

// PancakeSwap V2 Factory & WBNB on BNB Chain
const PANCAKE_FACTORY = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';
const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) view returns (address)',
];

const PAIR_ABI = [
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() view returns (address)',
  'function totalSupply() view returns (uint256)',
];

const ERC20_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export interface LiquidityMetrics {
  tokenLiquidity: number;
  liquidityRatio: number;
  chainConcentration: number;
  rugPullRisk: number;
  riskScore: number;
  hasPancakeswapPair: boolean;
  liquidityBNB: string;
  tokenSymbol: string;
}

function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL, {
    name: 'bnb',
    chainId: 56,
  });
}

/**
 * Analyze liquidity risks using real on-chain data
 */
export async function analyzeLiquidity(address: string): Promise<LiquidityMetrics> {
  const provider = getProvider();

  try {
    const code = await provider.getCode(address).catch(() => '0x');
    const isContract = code !== '0x' && code.length > 2;

    if (!isContract) {
      const balance = await provider.getBalance(address).catch(() => BigInt(0));
      const balanceBNB = parseFloat(ethers.formatEther(balance));

      let riskScore = 0;
      let rugPullRisk = 0;

      if (balanceBNB === 0) {
        riskScore += 20;
        rugPullRisk += 10;
      } else if (balanceBNB < 0.1) {
        riskScore += 15;
        rugPullRisk += 5;
      }

      return {
        tokenLiquidity: balanceBNB,
        liquidityRatio: balanceBNB > 0 ? 0.5 : 0,
        chainConcentration: 100,
        rugPullRisk: Math.min(rugPullRisk, 100),
        riskScore: Math.min(riskScore, 100),
        hasPancakeswapPair: false,
        liquidityBNB: balanceBNB.toFixed(4),
        tokenSymbol: 'BNB',
      };
    }

    // Token contract - analyze PancakeSwap liquidity
    const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);

    let tokenSymbol = 'UNKNOWN';
    let decimals = 18;

    try {
      [tokenSymbol, decimals] = await Promise.all([
        tokenContract.symbol().catch(() => 'UNKNOWN'),
        tokenContract.decimals().catch(() => 18),
      ]);
    } catch {
      logger.warn(`Could not read ERC20 info for ${address}`);
    }

    let hasPancakeswapPair = false;
    let liquidityBNB = '0';
    let liquidityRatio = 0;
    let tokenLiquidity = 0;

    try {
      const factory = new ethers.Contract(PANCAKE_FACTORY, FACTORY_ABI, provider);
      const pairAddress = await factory.getPair(address, WBNB_ADDRESS);

      if (pairAddress !== ethers.ZeroAddress) {
        hasPancakeswapPair = true;
        const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);

        const [reserves, token0] = await Promise.all([
          pair.getReserves(),
          pair.token0(),
        ]);

        const isToken0BNB = token0.toLowerCase() === WBNB_ADDRESS.toLowerCase();
        const bnbReserve = isToken0BNB ? reserves[0] : reserves[1];
        const tokenReserve = isToken0BNB ? reserves[1] : reserves[0];

        liquidityBNB = ethers.formatEther(bnbReserve);
        tokenLiquidity = parseFloat(liquidityBNB);

        const bnbVal = parseFloat(ethers.formatEther(bnbReserve));
        const tokenVal = parseFloat(ethers.formatUnits(tokenReserve, decimals));

        if (bnbVal + tokenVal > 0) {
          liquidityRatio = bnbVal / (bnbVal + tokenVal);
        }
      }
    } catch (error) {
      logger.warn(`Could not check PancakeSwap pair for ${address}:`, { error });
    }

    let riskScore = 0;
    let rugPullRisk = 0;

    if (!hasPancakeswapPair) {
      riskScore += 25;
      rugPullRisk += 30;
    } else {
      if (tokenLiquidity < 1) {
        riskScore += 30;
        rugPullRisk += 25;
      } else if (tokenLiquidity < 10) {
        riskScore += 20;
        rugPullRisk += 15;
      } else if (tokenLiquidity < 50) {
        riskScore += 10;
        rugPullRisk += 5;
      }

      if (liquidityRatio < 0.2 || liquidityRatio > 0.8) {
        rugPullRisk += 20;
        riskScore += 15;
      } else if (liquidityRatio < 0.35 || liquidityRatio > 0.65) {
        rugPullRisk += 10;
        riskScore += 10;
      }
    }

    logger.info(`Liquidity analysis for ${address}: pair=${hasPancakeswapPair}, liquidityBNB=${liquidityBNB}, symbol=${tokenSymbol}`);

    return {
      tokenLiquidity,
      liquidityRatio,
      chainConcentration: 100,
      rugPullRisk: Math.min(rugPullRisk, 100),
      riskScore: Math.min(riskScore, 100),
      hasPancakeswapPair,
      liquidityBNB,
      tokenSymbol,
    };
  } catch (error) {
    logger.error(`Failed to analyze liquidity for ${address}:`, { error });
    return {
      tokenLiquidity: 0,
      liquidityRatio: 0,
      chainConcentration: 0,
      rugPullRisk: 30,
      riskScore: 40,
      hasPancakeswapPair: false,
      liquidityBNB: '0',
      tokenSymbol: 'UNKNOWN',
    };
  }
}

/**
 * Detect suspicious liquidity patterns using real data
 */
export async function detectLiquidityAnomalies(address: string): Promise<string[]> {
  const anomalies: string[] = [];

  try {
    const metrics = await analyzeLiquidity(address);

    if (!metrics.hasPancakeswapPair) {
      anomalies.push('No PancakeSwap trading pair found');
    }

    if (metrics.tokenLiquidity < 1 && metrics.hasPancakeswapPair) {
      anomalies.push('Very low liquidity in trading pair');
    }

    if (metrics.rugPullRisk > 50) {
      anomalies.push('High rug pull risk based on liquidity analysis');
    }

    if (metrics.liquidityRatio < 0.1 || metrics.liquidityRatio > 0.9) {
      anomalies.push('Severely imbalanced liquidity pool');
    }
  } catch (error) {
    logger.warn(`Could not detect liquidity anomalies for ${address}:`, { error });
    anomalies.push('Unable to verify liquidity data');
  }

  return anomalies;
}
