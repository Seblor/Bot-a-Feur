#!/bin/sh
set -e

# Validate required environment variables
if [ -z "$DISCORD_TOKEN" ]; then
  echo "ERROR: DISCORD_TOKEN environment variable is not set" >&2
  exit 1
fi
if [ -z "$LOGS_WEBHOOK" ]; then
  echo "ERROR: LOGS_WEBHOOK environment variable is not set" >&2
  exit 1
fi

# Install / sync dependencies (fast no-op when lockfile is unchanged)
bun install

exec bun run src/index.ts
