/**
 * Runtime Bridge Client
 * Created by Francis Okorie Iyeke-Kanu
 *
 * Client service for communicating with the ARIA Sidecar (Python FastAPI server).
 * Handles all terminal and filesystem operations.
 */

const DEFAULT_BASE_URL = 'http://localhost:8000';
const TOKEN_STORAGE_KEY = 'aria_runtime_token';

export interface ExecuteCommandRequest {
  command: string;
  cwd?: string;
  timeout?: number;
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
   * Execute a shell command
   */
  async executeCommand(
    command: string,
    cwd?: string,
    timeout?: number
  ): Promise<ExecuteCommandResponse> {
    return this.request<ExecuteCommandResponse>('/execute', {
      method: 'POST',
      body: JSON.stringify({
        command,
        cwd,
        timeout,
      } as ExecuteCommandRequest),
    });
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
