# ARIA Sidecar - Local Agent Runtime

The ARIA Sidecar is a Python FastAPI server that runs locally and provides secure access to terminal commands and file system operations. This bridges the browser sandbox gap, allowing ARIA agents to execute real commands and interact with your host operating system.

## Prerequisites

- Python 3.11 or higher
- `pip` package manager

## Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   ```bash
   # On macOS/Linux:
   source venv/bin/activate

   # On Windows:
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Copy environment file (optional):**
   ```bash
   cp .env.example .env
   # Edit .env if you need custom configuration
   ```

## Running the Server

Start the server with:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Important:** The server will bind to `127.0.0.1` (localhost only) for security. It will NEVER bind to `0.0.0.0`.

## Authentication

On startup, the server will generate a random **ARIA Access Token** and print it to the console:

```
ARIA_ACCESS_TOKEN: 550e8400-e29b-41d4-a716-446655440000
```

**You must copy this token** and enter it in the ARIA Frontend Settings page to "pair" the UI with the Runtime.

All API requests must include this token in the `Authorization` header:
```
Authorization: Bearer <your-token-here>
```

## API Endpoints

### Health Check
- `GET /health` - Returns server status

### Terminal Execution
- `POST /execute` - Execute a shell command

### File System
- `POST /fs/read` - Read file content
- `POST /fs/write` - Write file content
- `POST /fs/list` - List directory contents

## Security

- **Localhost Only:** Server binds to `127.0.0.1` only
- **Token Authentication:** All requests require valid token
- **Path Sandboxing:** File operations restricted to workspace root
- **Command Validation:** Only safe commands are allowed by default

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, you can change it:
```bash
uvicorn main:app --host 127.0.0.1 --port 8001
```

### Permission Errors
Make sure you have read/write permissions in the workspace directory.

### Connection Refused
- Ensure the server is running
- Check that you're using the correct token
- Verify CORS is configured for `localhost:5173`

## Development

To run in development mode with auto-reload:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## License

Part of the ARIA project by Francis Okorie Iyeke-Kanu
