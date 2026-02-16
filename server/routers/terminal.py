"""
Terminal Execution Router
Created by Francis Okorie Iyeke-Kanu

Handles terminal command execution via subprocess with security validation.
"""

import subprocess
import time
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from security.auth import verify_token
from security.validator import validate_command, requires_approval
from security.sandbox import validate_path, sanitize_path, get_workspace_root

router = APIRouter(prefix="/execute", tags=["terminal"])


class ExecuteRequest(BaseModel):
    """Request model for command execution"""
    command: str = Field(..., description="Shell command to execute")
    cwd: Optional[str] = Field(None, description="Working directory (default: workspace root)")
    timeout: Optional[int] = Field(30, description="Timeout in seconds (default: 30)")


class ExecuteResponse(BaseModel):
    """Response model for command execution"""
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: int
    requires_approval: bool = False
    risk_level: Optional[str] = None


@router.post("", response_model=ExecuteResponse)
async def execute_command(
    request: ExecuteRequest,
    token: str = Depends(verify_token)
):
    """
    Execute a shell command securely.

    The command is validated against allowlist/blocklist patterns,
    and the working directory is validated to be within the workspace.

    Args:
        request: ExecuteRequest with command, cwd, and timeout
        token: Authentication token (from verify_token dependency)

    Returns:
        ExecuteResponse with stdout, stderr, exit_code, and timing info

    Raises:
        HTTPException(400): If command is invalid or path is outside workspace
        HTTPException(401): If token is invalid
    """
    # Validate command
    is_safe, risk_level, reason = validate_command(request.command)

    if not is_safe:
        # Check if it requires approval (medium/high risk)
        if requires_approval(request.command):
            return ExecuteResponse(
                stdout="",
                stderr="",
                exit_code=-1,
                execution_time_ms=0,
                requires_approval=True,
                risk_level=risk_level
            )
        else:
            # High-risk blocked command
            raise HTTPException(
                status_code=400,
                detail=f"Command rejected: {reason}"
            )

    # Validate and sanitize working directory
    if request.cwd:
        if not validate_path(request.cwd):
            raise HTTPException(
                status_code=400,
                detail=f"Working directory outside workspace: {request.cwd}"
            )
        cwd = sanitize_path(request.cwd)
    else:
        cwd = str(get_workspace_root())

    # Ensure cwd exists
    if not Path(cwd).exists():
        raise HTTPException(
            status_code=400,
            detail=f"Working directory does not exist: {cwd}"
        )

    # Execute command
    start_time = time.time()

    try:
        result = subprocess.run(
            request.command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=request.timeout,
            check=False  # Don't raise on non-zero exit
        )

        execution_time_ms = int((time.time() - start_time) * 1000)

        return ExecuteResponse(
            stdout=result.stdout,
            stderr=result.stderr,
            exit_code=result.returncode,
            execution_time_ms=execution_time_ms,
            requires_approval=False,
            risk_level=risk_level
        )

    except subprocess.TimeoutExpired:
        execution_time_ms = int((time.time() - start_time) * 1000)
        raise HTTPException(
            status_code=408,
            detail=f"Command timed out after {request.timeout} seconds"
        )
    except Exception as e:
        execution_time_ms = int((time.time() - start_time) * 1000)
        raise HTTPException(
            status_code=500,
            detail=f"Command execution failed: {str(e)}"
        )


from fastapi.responses import StreamingResponse
import asyncio

@router.post("/stream", response_class=StreamingResponse)
async def execute_command_stream(
    request: ExecuteRequest,
    token: str = Depends(verify_token)
):
    """
    Execute a shell command and stream the output via SSE.
    """
    # Validate command (reuse existing logic)
    is_safe, risk_level, reason = validate_command(request.command)
    if not is_safe:
        if requires_approval(request.command):
            # For now, we block requiring approval in stream mode until UI supports it
            raise HTTPException(status_code=400, detail="Command requires approval (not supported in stream mode yet)")
        else:
            raise HTTPException(status_code=400, detail=f"Command rejected: {reason}")

    # Validate cwd
    if request.cwd:
        if not validate_path(request.cwd):
            raise HTTPException(status_code=400, detail=f"Working directory outside workspace: {request.cwd}")
        cwd = sanitize_path(request.cwd)
    else:
        cwd = str(get_workspace_root())

    if not Path(cwd).exists():
        raise HTTPException(status_code=400, detail=f"Working directory does not exist: {cwd}")

    async def event_generator():
        process = subprocess.Popen(
            request.command,
            shell=True,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,  # Line buffered
            universal_newlines=True
        )

        try:
            # Stream stdout/stderr line by line
            for line in iter(process.stdout.readline, ''):
                if line:
                    yield f"data: {line}\n\n"
                    # Small delay to yield control back to event loop if needed
                    await asyncio.sleep(0)

            process.stdout.close()
            return_code = process.wait()

            if return_code != 0:
                yield f"data: [EXIT] {return_code}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
            try:
                process.kill()
            except:
                pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")
