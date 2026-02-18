/**
 * SafeLayer Risk Sentinel — OpenClaw Plugin Entry Point
 *
 * Registers 4 agent tools and the background block watcher service
 * for autonomous BNB Chain contract risk analysis.
 */

import { registerMonitorBlocksTool } from './tools/monitorBlocks';
import { registerAnalyzeAddressTool } from './tools/analyzeAddress';
import { registerSubmitOnChainTool } from './tools/submitOnChain';
import { registerQueryRegistryTool } from './tools/queryRegistry';
import { BlockWatcherService } from './services/blockWatcher';

interface PluginLogger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(id: string, params: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
  }>;
}

interface ServiceDefinition {
  id: string;
  start(): Promise<void> | void;
  stop(): Promise<void> | void;
}

export interface PluginAPI {
  logger: PluginLogger;
  registerTool(tool: ToolDefinition): void;
  registerService(service: ServiceDefinition): void;
}

export default function register(api: PluginAPI): void {
  api.logger.info('[SafeLayer] Registering SafeLayer Risk Sentinel plugin');

  // Register agent tools
  registerMonitorBlocksTool(api);
  registerAnalyzeAddressTool(api);
  registerSubmitOnChainTool(api);
  registerQueryRegistryTool(api);

  // Register background block watcher service
  const watcher = new BlockWatcherService();
  api.registerService({
    id: 'bnb-block-watcher',
    start: () => watcher.start(),
    stop: () => watcher.stop(),
  });

  api.logger.info('[SafeLayer] Plugin registered — 4 tools + block watcher service');
}
