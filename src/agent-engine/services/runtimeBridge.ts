/**
 * Runtime Bridge Client
 * Created by Francis Okorie Iyeke-Kanu
 *
 * Client service for communicating with the ARIA Sidecar (Python FastAPI server).
 * Handles all terminal and filesystem operations.
 */

import { terminalSignals } from '@/lib/signals';

const DEFAULT_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env.VITE_RUNTIME_URL as string | undefined)) ||
  'http://localhost:8001';
const TOKEN_STORAGE_KEY = 'aria_runtime_token';

export interface ExecuteCommandRequest {
  command: string;
  cwd?: string;
  timeout?: number;
  /** True after the user approves a medium/high-risk command in the UI */
  approved?: boolean;
}

export interface ExecuteCommandResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
  requires_approval: boolean;
  risk_level?: string;
}

export interface ReadFileRequest {
  path: string;
}

export interface ReadFileResponse {
  content: string;
  size_bytes: number;
  path: string;
}

export interface WriteFileRequest {
  path: string;
  content: string;
}

export interface WriteFileResponse {
  success: boolean;
  bytes_written: number;
  path: string;
}

export interface ListDirectoryRequest {
  path?: string;
  depth?: number;
}

export interface FileNode {
  type: 'file' | 'directory';
  name: string;
  path: string;
  size_bytes?: number;
  children?: FileNode[];
}

export interface ListDirectoryResponse {
  type: string;
  name: string;
  path: string;
  children: FileNode[];
}

export interface HealthResponse {
  status: string;
  version: string;
  service: string;
}

export class RuntimeClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = this.loadToken();
  }

  /**
   * Load token from localStorage
   */
  private loadToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  /**
   * Set and store the ARIA access token
   */
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  }

  /**
   * Get the current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear the stored token
   */
  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  /**
   * Make an authenticated request to the Sidecar
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.token) {
      throw new Error('No ARIA access token set. Please configure it in Settings.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${this.token}`);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * True when a token is stored and /health responds ok.
   */
  async isReady(): Promise<boolean> {
    if (!this.getToken()) return false;
    try {
      const health = await this.checkHealth();
      return health?.status === 'ok';
    } catch {
      return false;
    }
  }

  /**
   * Check if the Sidecar is running and healthy
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Cannot connect to ARIA Sidecar at ${this.baseUrl}. Is it running?`);
    }
  }

  /**
   * Execute a shell command (non-stream). Emits terminalSignals for the UI panel.
   * Pass approved=true after HITL approval when the first response had requires_approval.
   */
  async executeCommand(
    command: string,
    cwd?: string,
    timeout?: number,
    approved: boolean = false
  ): Promise<ExecuteCommandResponse> {
    terminalSignals.start.emit(command);

    try {
      const result = await this.request<ExecuteCommandResponse>('/execute', {
        method: 'POST',
        body: JSON.stringify({
          command,
          cwd,
          timeout,
          approved,
        } as ExecuteCommandRequest),
      });

      if (result.requires_approval) {
        terminalSignals.output.emit(
          `[approval required] risk=${result.risk_level || 'unknown'}\n`
        );
        terminalSignals.end.emit(-1);
        return result;
      }

      if (result.stdout) {
        terminalSignals.output.emit(result.stdout);
      }
      if (result.stderr) {
        terminalSignals.output.emit(
          result.stdout ? `\n[stderr]\n${result.stderr}` : result.stderr
        );
      }
      if (!result.stdout && !result.stderr) {
        terminalSignals.output.emit('(no output)\n');
      }

      terminalSignals.end.emit(result.exit_code);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      terminalSignals.output.emit(`\nExecution failed: ${message}\n`);
      terminalSignals.end.emit(-1);
      throw error;
    }
  }

  /**
   * Read a file from the workspace
   */
  async readFile(path: string): Promise<ReadFileResponse> {
    return this.request<ReadFileResponse>('/fs/read', {
      method: 'POST',
      body: JSON.stringify({
        path,
      } as ReadFileRequest),
    });
  }

  /**
   * Write content to a file in the workspace
   */
  async writeFile(path: string, content: string): Promise<WriteFileResponse> {
    return this.request<WriteFileResponse>('/fs/write', {
      method: 'POST',
      body: JSON.stringify({
        path,
        content,
      } as WriteFileRequest),
    });
  }

  /**
   * Execute a shell command with streaming output
   */
  async executeCommandStream(
    command: string,
    cwd?: string,
    timeout?: number
  ): Promise<ExecuteCommandResponse> {
    if (!this.token) {
      throw new Error('No ARIA access token set. Please configure it in Settings.');
    }

    const start = Date.now();
    terminalSignals.start.emit(command);

    try {
      const response = await fetch(`${this.baseUrl}/execute/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          command,
          cwd,
          timeout,
        } as ExecuteCommandRequest),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let stdout = '';
      let exitCode = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            if (data.startsWith('[EXIT] ')) {
              exitCode = parseInt(data.slice(7), 10);
              continue;
            }

            if (data.startsWith('[ERROR] ')) {
              terminalSignals.output.emit(`Error: ${data.slice(8)}\n`);
              continue;
            }

            stdout += data;
            terminalSignals.output.emit(data);
          }
        }
      }

      terminalSignals.end.emit(exitCode);

      return {
        stdout,
        stderr: '', // Stderr is merged into stdout in streaming mode for now
        exit_code: exitCode,
        execution_time_ms: Date.now() - start,
        requires_approval: false,
      };

    } catch (error) {
      terminalSignals.output.emit(`\nExecution failed: ${error}\n`);
      terminalSignals.end.emit(-1);
      throw error;
    }
  }

  /**
   * List directory contents recursively
   */
  async listDirectory(path?: string, depth?: number): Promise<ListDirectoryResponse> {
    return this.request<ListDirectoryResponse>('/fs/list', {
      method: 'POST',
      body: JSON.stringify({
        path,
        depth,
      } as ListDirectoryRequest),
    });
  }
}

// Export singleton instance
export const runtimeClient = new RuntimeClient();
