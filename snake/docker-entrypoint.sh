#!/bin/sh
# Set default value if DEPLOYMENT_ID is not set
export DEPLOYMENT_ID=${DEPLOYMENT_ID:-"not-set"}

# Substitute environment variables in the HTML template
sed -i "s/{{DEPLOYMENT_ID}}/${DEPLOYMENT_ID}/g" /usr/share/nginx/html/index.html

# Start nginx
exec nginx -g "daemon off;"
