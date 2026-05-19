#!/bin/sh
set -e

# Inject runtime environment into env-config.js so the built
# SPA can read API_BASE_URL without a rebuild.
cat > /usr/share/nginx/html/env-config.js <<EOF
window.__ENV__ = {
  API_BASE_URL: "${API_BASE_URL:-}"
};
EOF

exec nginx -g 'daemon off;'
