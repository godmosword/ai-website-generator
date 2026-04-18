FROM node:22-bookworm-slim

# Git + CA bundle: npm workspaces / optional git deps; HTTPS fetches.
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*
