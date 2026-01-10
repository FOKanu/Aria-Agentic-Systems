"""
Filesystem Operations Router
Created by Francis Okorie Iyeke-Kanu

Handles file system operations (read, write, list) with security validation.
"""

from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from security.auth import verify_token
from security.sandbox import validate_path, sanitize_path, get_workspace_root

router = APIRouter(prefix="/fs", tags=["filesystem"])


class ReadFileRequest(BaseModel):
    """Request model for reading a file"""
    path: str = Field(..., description="Path to file relative to workspace root")


class ReadFileResponse(BaseModel):
    """Response model for reading a file"""
    content: str
    size_bytes: int
    path: str


class WriteFileRequest(BaseModel):
    """Request model for writing a file"""
    path: str = Field(..., description="Path to file relative to workspace root")
    content: str = Field(..., description="File content to write")


class WriteFileResponse(BaseModel):
    """Response model for writing a file"""
    success: bool
    bytes_written: int
    path: str


class ListDirectoryRequest(BaseModel):
    """Request model for listing directory"""
    path: Optional[str] = Field(None, description="Path to directory (default: workspace root)")
    depth: Optional[int] = Field(1, description="Recursion depth (default: 1)")


class FileNode(BaseModel):
    """Model for file/directory node in tree"""
    type: str  # "file" or "directory"
    name: str
    path: str
    size_bytes: Optional[int] = None
    children: Optional[List["FileNode"]] = None


class ListDirectoryResponse(BaseModel):
    """Response model for listing directory"""
    type: str
    name: str
    path: str
    children: List[FileNode]


@router.post("/read", response_model=ReadFileResponse)
async def read_file(
    request: ReadFileRequest,
    token: str = Depends(verify_token)
):
    """
    Read a file from the workspace.

    The path is validated to ensure it's within the workspace root.

    Args:
        request: ReadFileRequest with file path
        token: Authentication token (from verify_token dependency)

    Returns:
        ReadFileResponse with file content and metadata

    Raises:
        HTTPException(400): If path is outside workspace or doesn't exist
        HTTPException(401): If token is invalid
    """
    # Validate path
    if not validate_path(request.path):
        raise HTTPException(
            status_code=400,
            detail=f"Path outside workspace: {request.path}"
        )

    # Sanitize and resolve path
    file_path = Path(sanitize_path(request.path))

    # Check if file exists
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"File not found: {request.path}"
        )

    # Check if it's actually a file (not a directory)
    if not file_path.is_file():
        raise HTTPException(
            status_code=400,
            detail=f"Path is not a file: {request.path}"
        )

    try:
        # Read file content
        content = file_path.read_text(encoding='utf-8')
        size_bytes = file_path.stat().st_size

        return ReadFileResponse(
            content=content,
            size_bytes=size_bytes,
            path=str(file_path.relative_to(get_workspace_root()))
        )

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail=f"File is not UTF-8 text: {request.path}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read file: {str(e)}"
        )


@router.post("/write", response_model=WriteFileResponse)
async def write_file(
    request: WriteFileRequest,
    token: str = Depends(verify_token)
):
    """
    Write content to a file in the workspace.

    The path is validated to ensure it's within the workspace root.
    If the file doesn't exist, it will be created. If it exists, it will be overwritten.
    Parent directories will be created if they don't exist.

    Args:
        request: WriteFileRequest with file path and content
        token: Authentication token (from verify_token dependency)

    Returns:
        WriteFileResponse with success status and bytes written

    Raises:
        HTTPException(400): If path is outside workspace
        HTTPException(401): If token is invalid
    """
    # Validate path
    if not validate_path(request.path):
        raise HTTPException(
            status_code=400,
            detail=f"Path outside workspace: {request.path}"
        )

    # Sanitize and resolve path
    file_path = Path(sanitize_path(request.path))

    # Check if parent is a directory (if parent exists)
    if file_path.parent.exists() and not file_path.parent.is_dir():
        raise HTTPException(
            status_code=400,
            detail=f"Parent path is not a directory: {file_path.parent}"
        )

    try:
        # Create parent directories if they don't exist
        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Write file content
        bytes_written = file_path.write_text(request.content, encoding='utf-8')

        return WriteFileResponse(
            success=True,
            bytes_written=bytes_written,
            path=str(file_path.relative_to(get_workspace_root()))
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to write file: {str(e)}"
        )


def _build_file_tree(path: Path, depth: int, current_depth: int = 0) -> FileNode:
    """
    Recursively build a file tree structure.

    Args:
        path: Path to directory or file
        depth: Maximum recursion depth
        current_depth: Current depth in recursion

    Returns:
        FileNode representing the file or directory tree
    """
    if path.is_file():
        return FileNode(
            type="file",
            name=path.name,
            path=str(path.relative_to(get_workspace_root())),
            size_bytes=path.stat().st_size,
            children=None
        )

    # It's a directory
    children = []
    if current_depth < depth:
        try:
            for item in sorted(path.iterdir()):
                # Skip hidden files/directories (optional - can be configurable)
                if item.name.startswith('.'):
                    continue
                children.append(_build_file_tree(item, depth, current_depth + 1))
        except PermissionError:
            # Skip directories we can't read
            pass

    return FileNode(
        type="directory",
        name=path.name,
        path=str(path.relative_to(get_workspace_root())),
        size_bytes=None,
        children=children if children else None
    )


@router.post("/list", response_model=ListDirectoryResponse)
async def list_directory(
    request: ListDirectoryRequest,
    token: str = Depends(verify_token)
):
    """
    List directory contents recursively up to a specified depth.

    The path is validated to ensure it's within the workspace root.

    Args:
        request: ListDirectoryRequest with directory path and depth
        token: Authentication token (from verify_token dependency)

    Returns:
        ListDirectoryResponse with directory tree structure

    Raises:
        HTTPException(400): If path is outside workspace or not a directory
        HTTPException(401): If token is invalid
    """
    # Use workspace root if path not provided
    if request.path:
        # Validate path
        if not validate_path(request.path):
            raise HTTPException(
                status_code=400,
                detail=f"Path outside workspace: {request.path}"
            )
        dir_path = Path(sanitize_path(request.path))
    else:
        dir_path = get_workspace_root()

    # Check if path exists
    if not dir_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Path does not exist: {request.path or 'workspace root'}"
        )

    # Check if it's a directory
    if not dir_path.is_dir():
        raise HTTPException(
            status_code=400,
            detail=f"Path is not a directory: {request.path or 'workspace root'}"
        )

    # Validate depth (prevent excessive recursion)
    depth = max(1, min(request.depth or 1, 10))  # Limit to 10 levels max

    try:
        # Build file tree
        tree = _build_file_tree(dir_path, depth, current_depth=0)

        return ListDirectoryResponse(
            type=tree.type,
            name=tree.name,
            path=tree.path,
            children=tree.children or []
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list directory: {str(e)}"
        )
