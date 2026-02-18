/**
 * Analyze Address Tool
 *
 * Invokes the SafeLayer Risk Intelligence Engine via the backend HTTP API.
 * Runs 5 parallel analyzers: contract, behavior, wallet, transparency, scam DB.
 * Returns a structured risk assessment with score, level, and evidence.
 */

import type { PluginAPI } from '../index';

const BACKEND_URL = process.env.SAFELAYER_BACKEND_URL || 'http://localhost:3001';

interface AnalyzeParams {
  address: string;
}

interface RiskFlag {
  severity: string;
  name: string;
  description: string;
  riskWeight: number;
}

export function registerAnalyzeAddressTool(api: PluginAPI): void {
  api.registerTool({
    name: 'bnb_analyze_address',
    description:
      'Runs the full SafeLayer Risk Intelligence Engine on a BNB Chain address. ' +
      'Returns risk score (0-100), risk level, category breakdown, evidence flags, ' +
      'and human-readable explanation. Takes 5-30 seconds.',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The BNB Chain address to analyze (0x followed by 40 hex characters)',
        },
      },
      required: ['address'],
    },
    async execute(_id: string, params: Record<string, unknown>) {
      const { address } = params as unknown as AnalyzeParams;
      const normalized = address.trim().toLowerCase();

      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Invalid address format. Must be 0x followed by 40 hex characters.' }),
          }],
        };
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/risk/${normalized}`, {
          signal: AbortSignal.timeout(60_000),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: `Backend returned ${response.status}`,
                details: errorBody,
              }),
            }],
          };
        }

        const data = await response.json();

        // Extract a concise summary for the agent's context window
        const allFlags: RiskFlag[] = [
          ...(data.evidence?.contract_flags || []),
          ...(data.evidence?.onchain_flags || []),
          ...(data.evidence?.wallet_flags || []),
          ...(data.evidence?.transparency_flags || []),
          ...(data.evidence?.scam_flags || []),
        ];

        const summary = {
          address: data.address,
          riskScore: data.riskScore,
          riskLevel: data.riskLevel,
          addressType: data.addressType,
          breakdown: data.breakdown,
          explanation: data.explanation?.summary || '',
          keyFindings: data.explanation?.keyFindings || [],
          recommendations: data.explanation?.recommendations || [],
          flagCount: {
            critical: allFlags.filter((f) => f.severity === 'critical').length,
            high: allFlags.filter((f) => f.severity === 'high').length,
            medium: allFlags.filter((f) => f.severity === 'medium').length,
            total: allFlags.length,
          },
          analysisTimeMs: data.analysisTimeMs,
          registry: data.registry,
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: `Failed to analyze address: ${message}`,
              hint: 'Ensure the SafeLayer backend is running at ' + BACKEND_URL,
            }),
          }],
        };
      }
    },
  });
}
