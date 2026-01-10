"""
Security Module - Path Sandbox
Created by Francis Okorie Iyeke-Kanu

Validates file paths to ensure they stay within the workspace root,
preventing directory traversal attacks (e.g., ../../etc/passwd).
"""

import os
from pathlib import Path
from typing import Optional

# Workspace root - defaults to current directory
# Can be overridden via environment variable or command-line argument
WORKSPACE_ROOT = Path(os.getcwd())


def set_workspace_root(path: str) -> None:
    """
    Set the workspace root directory.
    All file operations will be restricted to this directory.

    Args:
        path: Absolute or relative path to workspace root
    """
    global WORKSPACE_ROOT
    WORKSPACE_ROOT = Path(path).resolve()
    print(f"📁 Workspace root set to: {WORKSPACE_ROOT}")


def validate_path(path: str) -> bool:
    """
    Validate that a path is within the workspace root.

    Prevents directory traversal attacks by ensuring the resolved path
    is a subdirectory of WORKSPACE_ROOT.

    Args:
        path: File or directory path to validate

    Returns:
        True if path is safe (within workspace), False otherwise

    Examples:
        >>> validate_path("src/App.tsx")  # True
        >>> validate_path("../../etc/passwd")  # False
    """
    try:
        # Resolve the path (handles relative paths, symlinks, etc.)
        resolved_path = Path(path).resolve()

        # Get the common path between resolved_path and WORKSPACE_ROOT
        # This will raise ValueError if paths are on different drives (Windows)
        try:
            common_path = Path(os.path.commonpath([resolved_path, WORKSPACE_ROOT]))
        except ValueError:
            # Different drives (Windows) - not safe
            return False

        # Path is safe if the common path equals the workspace root
        # This means resolved_path is within WORKSPACE_ROOT
        return common_path == WORKSPACE_ROOT

    except (OSError, ValueError):
        # Invalid path or error resolving
        return False


def sanitize_path(path: str) -> str:
    """
    Sanitize and normalize a file path.

    Resolves relative paths, removes redundant separators, and normalizes
    the path. Does NOT validate - use validate_path() for that.

    Args:
        path: Path to sanitize

    Returns:
        Normalized absolute path as string

    Examples:
        >>> sanitize_path("./src/App.tsx")
        '/absolute/path/to/workspace/src/App.tsx'
    """
    try:
        return str(Path(path).resolve())
    except (OSError, ValueError):
        # If resolution fails, return the original path
        return path


def get_workspace_root() -> Path:
    """
    Get the current workspace root directory.

    Returns:
        Path object of workspace root
    """
    return WORKSPACE_ROOT


def is_within_workspace(path: str) -> bool:
    """
    Alias for validate_path() for clearer semantics.

    Args:
        path: Path to check

    Returns:
        True if path is within workspace
    """
    return validate_path(path)
