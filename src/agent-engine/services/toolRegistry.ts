import { runtimeClient } from './runtimeBridge';
import { AITool } from '../types';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
    }>;
    required?: string[];
  };
  execute: (args: any, ctx?: ToolExecuteContext) => Promise<any>;
}

export interface ApprovalRequest {
  id: string;
  toolName: string;
  description: string;
  command?: string;
  riskLevel?: string;
  args: unknown;
}

export interface ToolExecuteContext {
  /** Return true to proceed with a risky command after UI approval */
  requestApproval?: (req: ApprovalRequest) => Promise<boolean>;
}

export const tools: Record<string, ToolDefinition> = {
  fs_list: {
    name: 'fs_list',
    description: 'List files and directories in a given path. Use depth to control recursion.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to list (default: current directory)' },
        depth: { type: 'number', description: 'Depth of recursion (default: 1)' },
      },
    },
    execute: async (args) => {
      const response = await runtimeClient.listDirectory(args.path, args.depth);
      return response;
    },
  },
  fs_read: {
    name: 'fs_read',
    description: 'Read the contents of a file.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the file to read' },
      },
      required: ['path'],
    },
    execute: async (args) => {
      const response = await runtimeClient.readFile(args.path);
      return response.content;
    },
  },
  fs_write: {
    name: 'fs_write',
    description: 'Write content to a file.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the file to write' },
        content: { type: 'string', description: 'Content to write' },
      },
      required: ['path', 'content'],
    },
    execute: async (args, ctx) => {
      // Treat writes as approval-gated when a handler is provided
      if (ctx?.requestApproval) {
        const ok = await ctx.requestApproval({
          id: `fs_write-${Date.now()}`,
          toolName: 'fs_write',
          description: `Write file: ${args.path}`,
          args,
          riskLevel: 'medium',
        });
        if (!ok) {
          return { error: 'User rejected file write', rejected: true };
        }
      }
      const response = await runtimeClient.writeFile(args.path, args.content);
      return response;
    },
  },
  execute_command: {
    name: 'execute_command',
    description: 'Execute a shell command.',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute' },
        cwd: { type: 'string', description: 'Current working directory' },
      },
      required: ['command'],
    },
    execute: async (args, ctx) => {
      const first = await runtimeClient.executeCommand(args.command, args.cwd);

      if (first.requires_approval) {
        if (!ctx?.requestApproval) {
          return {
            ...first,
            error: 'Command requires approval but no approval UI is available',
            rejected: true,
          };
        }

        const ok = await ctx.requestApproval({
          id: `cmd-${Date.now()}`,
          toolName: 'execute_command',
          description: `Run command (${first.risk_level || 'risk'}): ${args.command}`,
          command: args.command,
          riskLevel: first.risk_level,
          args,
        });

        if (!ok) {
          return {
            rejected: true,
            error: 'User rejected command execution',
            command: args.command,
            risk_level: first.risk_level,
          };
        }

        // Re-run with approved=true; Terminal panel will show output
        return runtimeClient.executeCommand(args.command, args.cwd, undefined, true);
      }

      return first;
    },
  },
};

export async function executeToolCall(
  name: string,
  args: any,
  ctx?: ToolExecuteContext
): Promise<any> {
  const tool = tools[name];
  if (!tool) {
    throw new Error(`Tool ${name} not found`);
  }
  try {
    return await tool.execute(args, ctx);
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export function getToolDefinitions(): AITool[] {
  return Object.values(tools).map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}
