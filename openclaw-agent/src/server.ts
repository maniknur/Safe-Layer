/**
 * SafeLayer Alert API Server
 *
 * Real-time HTTP API for querying risk alerts, verification,
 * and AI disclosure logs. Runs alongside the autonomous agent.
 *
 * Endpoints:
 *   GET /alerts               — Recent risk alerts
 *   GET /alerts/high          — High-risk alerts only
 *   GET /alerts/:address      — Alerts for specific address
 *   GET /alerts/stats         — Alert statistics
 *   GET /verify/:address      — Verify on-chain proof
 *   GET /disclosure           — AI disclosure log
 *   GET /health               — Agent health check
 */

import * as http from 'http';
import { AlertStore } from './services/alertStore';
import { DisclosureLog } from './services/disclosureLog';
import { ProofVerifier } from './services/proofVerifier';

function json(res: http.ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data, null, 2));
}

export function startAlertServer(
  alertStore: AlertStore,
  disclosureLog: DisclosureLog,
  proofVerifier: ProofVerifier,
  port: number
): http.Server {
  const startTime = Date.now();

  const server = http.createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://localhost:${port}`);
    const pathname = url.pathname;

    try {
      // ─── GET /health ───
      if (pathname === '/health') {
        json(res, {
          status: 'running',
          agent: 'SafeLayer Risk Sentinel',
          framework: 'OpenClaw',
          chain: 'BNB Chain Testnet',
          uptime: Math.round((Date.now() - startTime) / 1000),
          alertCount: alertStore.count(),
          disclosureCount: disclosureLog.count(),
        });
        return;
      }

      // ─── GET /alerts/stats ───
      if (pathname === '/alerts/stats') {
        json(res, alertStore.stats());
        return;
      }

      // ─── GET /alerts/high ───
      if (pathname === '/alerts/high') {
        json(res, {
          alerts: alertStore.getHighRisk(),
          count: alertStore.getHighRisk().length,
        });
        return;
      }

      // ─── GET /alerts/:address ───
      const addressMatch = pathname.match(/^\/alerts\/(0x[a-fA-F0-9]{40})$/);
      if (addressMatch) {
        const alerts = alertStore.getByAddress(addressMatch[1]);
        json(res, {
          address: addressMatch[1],
          alerts,
          count: alerts.length,
        });
        return;
      }

      // ─── GET /alerts ───
      if (pathname === '/alerts') {
        const limit = Number(url.searchParams.get('limit')) || 50;
        const level = url.searchParams.get('level');

        const alerts = level
          ? alertStore.getByRiskLevel(level)
          : alertStore.getRecent(limit);

        json(res, {
          alerts,
          count: alerts.length,
          total: alertStore.count(),
        });
        return;
      }

      // ─── GET /verify/:address ───
      const verifyMatch = pathname.match(/^\/verify\/(0x[a-fA-F0-9]{40})$/);
      if (verifyMatch) {
        const address = verifyMatch[1];

        // Find the most recent alert for this address to get reportData
        const alerts = alertStore.getByAddress(address);
        if (alerts.length === 0) {
          json(res, {
            address,
            verified: false,
            error: 'No local alert found for this address. Use the on-chain query instead.',
          });
          return;
        }

        const latest = alerts[0];
        const reportData = {
          address: latest.address.toLowerCase(),
          riskScore: latest.riskScore,
          riskLevel: latest.riskLevel,
          breakdown: latest.breakdown,
          timestamp: latest.timestamp,
          schemaVersion: '2.0',
        };

        const result = await proofVerifier.verifyFull(address, reportData, latest.reportHash);
        json(res, result);
        return;
      }

      // ─── GET /disclosure ───
      if (pathname === '/disclosure') {
        const limit = Number(url.searchParams.get('limit')) || 50;
        const history = url.searchParams.get('full') === 'true';

        json(res, {
          entries: history ? disclosureLog.readHistory() : disclosureLog.getRecent(limit),
          count: disclosureLog.count(),
          format: 'AI Disclosure Log — SafeLayer Autonomous Agent',
          note: 'Every entry records an autonomous AI decision and its on-chain action.',
        });
        return;
      }

      // ─── 404 ───
      json(res, {
        error: 'Not found',
        endpoints: [
          'GET /health',
          'GET /alerts',
          'GET /alerts/stats',
          'GET /alerts/high',
          'GET /alerts/:address',
          'GET /verify/:address',
          'GET /disclosure',
        ],
      }, 404);
    } catch (err) {
      json(res, {
        error: err instanceof Error ? err.message : 'Internal server error',
      }, 500);
    }
  });

  server.listen(port, () => {
    console.log(`[AlertAPI] Server running at http://localhost:${port}`);
    console.log(`[AlertAPI] Endpoints:`);
    console.log(`  GET http://localhost:${port}/health`);
    console.log(`  GET http://localhost:${port}/alerts`);
    console.log(`  GET http://localhost:${port}/alerts/stats`);
    console.log(`  GET http://localhost:${port}/alerts/high`);
    console.log(`  GET http://localhost:${port}/alerts/0x...`);
    console.log(`  GET http://localhost:${port}/verify/0x...`);
    console.log(`  GET http://localhost:${port}/disclosure`);
  });

  return server;
}
