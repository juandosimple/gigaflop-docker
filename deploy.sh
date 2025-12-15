#!/bin/bash

# Configuration
# Usage: ./deploy.sh user@remote_host
REMOTE_USER_HOST=$1
REMOTE_DIR="/var/www/itnow.com.ar/"

# Check if remote host is provided
if [ -z "$REMOTE_USER_HOST" ]; then
    echo "Usage: $0 root@74.50.84.165"
    exit 1
fi

echo "🚀 Starting deployment to $REMOTE_USER_HOST..."

# 1. Check for rsync
if ! command -v rsync &> /dev/null; then
    echo "❌ Error: rsync is not installed. Please install it first."
    exit 1
fi

# 2. Sync files to remote server
echo "📦 Syncing files..."
rsync -avz --exclude 'node_modules' \
           --exclude '.git' \
           --exclude '.env' \
           --exclude 'dist' \
           --exclude 'build' \
           --exclude '.DS_Store' \
           ./ "$REMOTE_USER_HOST:$REMOTE_DIR"

if [ $? -ne 0 ]; then
    echo "❌ Error during file sync."
    exit 1
fi

# 3. Remote Execution
echo "🔄 Restarting services on remote server..."
ssh "$REMOTE_USER_HOST" << EOF
    cd $REMOTE_DIR
    
    # Create necessary volumes if they don't exist
    docker volume create db_data

    # Build and start containers
    echo "🐳 Building and starting containers..."
    # Build and start containers
    echo "🐳 Building and starting containers..."
    docker compose down
    docker compose up -d --build || { echo "❌ 'docker compose' failed. Trying legacy 'docker-compose'..."; docker-compose down; docker-compose up -d --build; }

    # Prune unused images to save space
    docker image prune -f

    echo "✅ Deployment complete! Services are running."
EOF

if [ $? -eq 0 ]; then
    echo "🎉 Deployed successfully to $REMOTE_USER_HOST"
else
    echo "❌ Error executing remote commands."
    exit 1
fi
