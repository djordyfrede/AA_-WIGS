#!/bin/bash
set -e

echo "[post-merge] Installing npm packages..."
npm install --no-fund --no-audit

echo "[post-merge] Done."
