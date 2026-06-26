#!/bin/bash
# SessionStart hook for Claude Code on the web.
# 1. Installs JS dependencies so the app/tooling work in remote sessions.
# 2. Writes .env from the session's environment variables.
#
# SECURITY: this script contains NO secret values. The API keys come from the
# session's encrypted env config (set in the Claude Code web UI) and are written
# only to .env, which is gitignored. Never hard-code keys in this file.
set -euo pipefail

# Only run in the remote (Claude Code on the web) environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install dependencies (cached after the hook completes; idempotent).
npm install --no-audit --no-fund

# Materialize .env from session-config env vars so OpenAI/Anthropic calls work.
# Values are empty if the corresponding env var isn't configured for the session.
{
  echo "OPENAI_API_KEY=${OPENAI_API_KEY:-}"
  echo "ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}"
} > .env
