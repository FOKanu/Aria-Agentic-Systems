"""
Security Module - Command Validator
Created by Francis Okorie Iyeke-Kanu

Validates shell commands against allowlist and blocklist patterns
to prevent execution of dangerous commands.
"""

import re
from typing import Tuple, Optional

# Risk levels
RISK_LOW = "low"
RISK_MEDIUM = "medium"
RISK_HIGH = "high"

# Allowed command patterns (regex)
# Commands matching these patterns are considered safe
ALLOWED_COMMANDS = [
    r"^git\s+",                    # Git commands
    r"^npm\s+",                    # npm commands
    r"^npm run\s+",                # npm run scripts
    r"^yarn\s+",                   # Yarn commands
    r"^pnpm\s+",                   # pnpm commands
    r"^ls\s*",                     # List directory
    r"^cat\s+",                    # Read file
    r"^pwd\s*$",                   # Print working directory
    r"^echo\s+",                   # Echo text
    r"^grep\s+",                   # Search text
    r"^find\s+",                   # Find files
    r"^head\s+",                   # Show file head
    r"^tail\s+",                   # Show file tail
    r"^wc\s+",                     # Word count
    r"^diff\s+",                   # File diff
    r"^mkdir\s+",                  # Create directory
    r"^touch\s+",                  # Create file
    r"^cp\s+",                     # Copy file
    r"^mv\s+",                     # Move file
    r"^python3?\s+",               # Python interpreter
    r"^node\s+",                   # Node.js
    r"^npx\s+",                    # npx commands
]

# Blocked command patterns (regex)
# Commands matching these patterns are ALWAYS rejected
BLOCKED_COMMANDS = [
    r"rm\s+-rf",                   # Force recursive delete
    r"rm\s+-r\s+-f",                # Force recursive delete (alternate)
    r"mkfs",                        # Format filesystem
    r"dd\s+",                       # Disk dump (can overwrite disk)
    r"sudo\s+",                     # Superuser commands
    r"su\s+",                       # Switch user
    r"chmod\s+777",                 # Dangerous permissions
    r"chmod\s+\+x\s+/",             # Make root executable
    r"fdisk",                       # Disk partitioning
    r"format",                      # Format disk
    r">\s*/dev/",                   # Redirect to device files
    r"curl\s+.*\s+\|",              # Pipe from curl (can execute arbitrary code)
    r"wget\s+.*\s+\|",              # Pipe from wget
    r":\s*\(\s*:\s*\|",             # Fork bomb pattern
    r"\.\s*\.\s*\.",                # Fork bomb (alternate)
]

# Medium-risk patterns (require careful review)
MEDIUM_RISK_PATTERNS = [
    r"rm\s+",                       # Delete (but not -rf)
    r"chmod\s+",                    # Change permissions
    r"chown\s+",                    # Change owner
    r">\s+",                        # File redirection (overwrite)
    r">>\s+",                       # File redirection (append)
]


def validate_command(command: str) -> Tuple[bool, str, str]:
    """
    Validate a shell command against allowlist and blocklist.

    Args:
        command: Shell command to validate

    Returns:
        Tuple of (is_safe, risk_level, reason)
        - is_safe: True if command is safe to execute
        - risk_level: "low", "medium", or "high"
        - reason: Human-readable explanation

    Examples:
        >>> validate_command("npm test")
        (True, "low", "Allowed command: npm")

        >>> validate_command("rm -rf /")
        (False, "high", "Blocked command: rm -rf")
    """
    command = command.strip()

    if not command:
        return (False, RISK_HIGH, "Empty command")

    # Check blocked commands first (highest priority)
    for pattern in BLOCKED_COMMANDS:
        if re.search(pattern, command, re.IGNORECASE):
            return (False, RISK_HIGH, f"Blocked command pattern: {pattern}")

    # Check allowed commands
    is_allowed = False
    matched_pattern = None
    for pattern in ALLOWED_COMMANDS:
        if re.match(pattern, command, re.IGNORECASE):
            is_allowed = True
            matched_pattern = pattern
            break

    if not is_allowed:
        # Check if it's a medium-risk command
        is_medium_risk = False
        for pattern in MEDIUM_RISK_PATTERNS:
            if re.search(pattern, command, re.IGNORECASE):
                is_medium_risk = True
                return (False, RISK_MEDIUM, f"Medium-risk command. Pattern: {pattern}")

        # Unknown command - high risk
        return (False, RISK_HIGH, "Unknown command not in allowlist")

    # Command is allowed - check for medium-risk patterns within allowed commands
    for pattern in MEDIUM_RISK_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            return (True, RISK_MEDIUM, f"Allowed command with medium-risk operation: {matched_pattern}")

    # Safe command
    return (True, RISK_LOW, f"Allowed command: {matched_pattern}")


def is_command_safe(command: str) -> bool:
    """
    Simple check if command is safe to execute.

    Args:
        command: Shell command to check

    Returns:
        True if safe, False otherwise
    """
    is_safe, _, _ = validate_command(command)
    return is_safe


def get_command_risk(command: str) -> str:
    """
    Get the risk level of a command.

    Args:
        command: Shell command to analyze

    Returns:
        Risk level: "low", "medium", or "high"
    """
    _, risk_level, _ = validate_command(command)
    return risk_level


def requires_approval(command: str) -> bool:
    """
    Check if command requires user approval before execution.

    Commands with "medium" or "high" risk require approval.

    Args:
        command: Shell command to check

    Returns:
        True if approval is required
    """
    _, risk_level, _ = validate_command(command)
    return risk_level in [RISK_MEDIUM, RISK_HIGH]
