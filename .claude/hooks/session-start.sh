#!/bin/bash
# SessionStart hook for Claude Code on the web.
# 1. Installs JS dependencies so the app/tooling work in remote sessions.
# 2. Syncs .env with any API keys provided by the session's env config.
#
# SECURITY: this script contains NO secret values. Keys come from the session's
# encrypted env config (set in the Claude Code web UI) and are written only to
# .env, which is gitignored. Never hard-code keys in this file.
set -euo pipefail

# Only run in the remote (Claude Code on the web) environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install dependencies (cached after the hook completes; idempotent).
npm install --no-audit --no-fund

# Sync .env from session-config env vars. Only keys that are actually set are
# written, so we never clobber an existing .env when a var isn't configured.
touch .env
for name in OPENAI_API_KEY ANTHROPIC_API_KEY; do
  val="${!name:-}"
  [ -z "$val" ] && continue
  grep -v "^${name}=" .env > .env.tmp 2>/dev/null || true
  mv .env.tmp .env
  echo "${name}=${val}" >> .env
done
