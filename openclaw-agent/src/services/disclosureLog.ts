/**
 * AI Disclosure Log
 *
 * Records every autonomous AI decision and on-chain action
 * for transparency and auditability. Required for hackathon
 * to prove autonomous execution.
 *
 * Each entry records:
 * - What the AI decided
 * - Why (risk score, analyzers used, scoring formula)
 * - What action was taken (tx hash)
 * - That it was autonomous (no human input)
 */

import * as fs from 'fs';
import * as path from 'path';

export interface DisclosureEntry {
  cycleId: number;
  address: string;
  action: 'onchain_submission' | 'alert_generated' | 'skip_duplicate' | 'skip_threshold';
  riskScore: number;
  riskLevel: string;
  txHash: string | null;
  reportHash: string;
  modelUsed: string;
  analyzersUsed: string[];
  scoringFormula: string;
  autonomous: boolean;
  timestamp: string;
}

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'ai-disclosure.jsonl');

export class DisclosureLog {
  private buffer: DisclosureEntry[] = [];

  constructor() {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  }

  log(entry: DisclosureEntry): void {
    this.buffer.push(entry);

    // Write immediately to JSONL file
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(LOG_FILE, line, 'utf-8');

    const action = entry.txHash
      ? `TX: ${entry.txHash}`
      : `Action: ${entry.action}`;
    console.log(
      `[AI-DISCLOSURE] Cycle #${entry.cycleId} | ${entry.address} | ` +
      `Score: ${entry.riskScore} | ${action} | Autonomous: ${entry.autonomous}`
    );
  }

  getAll(): DisclosureEntry[] {
    return this.buffer;
  }

  getRecent(limit = 50): DisclosureEntry[] {
    return this.buffer.slice(-limit);
  }

  /** Read full history from disk (includes entries from previous runs) */
  readHistory(): DisclosureEntry[] {
    if (!fs.existsSync(LOG_FILE)) return [];

    try {
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      return content
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line) as DisclosureEntry);
    } catch {
      return [];
    }
  }

  /** Flush buffer (called on shutdown) */
  flush(): void {
    console.log(`[AI-DISCLOSURE] Flushed ${this.buffer.length} entries to ${LOG_FILE}`);
  }

  count(): number {
    return this.buffer.length;
  }
}
