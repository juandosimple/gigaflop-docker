# Deployment Guide

This guide explains how to deploy your application to a Linux server (Ubuntu/Debian recommended) using the included `deploy.sh` script.

## Prerequisites

1.  **Remote Server**: Verified SSH access to your server (e.g., `ssh root@your-server-ip`).
2.  **Docker & Docker Compose**: Must be installed on the remote server.
    ```bash
    # Run these on your server if Docker is not installed
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    ```

## Method A: Automated Deployment (Recommended)

The `deploy.sh` script automates file transfer (using `rsync`) and container management (using `docker-compose`).

### 1. Make the script executable
On your **local machine**, run:
```bash
chmod +x deploy.sh
```

### 2. Run the deployment
Replace `user` and `your-server-ip` with your actual server credentials.
```bash
./deploy.sh user@your-server-ip
```
*Example: `./deploy.sh root@123.45.67.89`*

This will:
1.  Copy your project files to `~/gigaflop-pro` on the server.
2.  Build the Docker images on the server.
3.  Start the application in the background.

## Method B: Manual Deployment

If you prefer to move files manually (e.g., via FileZilla):

1.  **Upload Files**: Upload the entire project folder to your server (excluding `node_modules`).
2.  **Connect via SSH**: `ssh user@your-server-ip`
3.  **Navigate directly**: `cd /path/to/uploaded/folder`
4.  **Run Docker Compose**:
    ```bash
    docker-compose up -d --build
    ```

## Post-Deployment Setup (First Time Only)

After the containers are running for the first time, you need to initialize the database:

1.  **Connect to your server**:
    ```bash
    ssh user@your-server-ip
    ```

2.  **Run the Database Setup Script**:
    This creates the admin user and tables.
    ```bash
    docker exec -it gigaflop_backend node setup_db.js
    ```
    *(Note: Wait about 30 seconds after deployment ensuring the database is fully ready before running this)*

3.  **Verify**: Log in to your app at `http://your-server-ip:8080`.

## Troubleshooting

-   **Permission Denied**: Ensure your SSH key is added (`ssh-add ~/.ssh/id_rsa`) or you have the correct password.
-   **Docker command not found**: Ensure Docker is installed and the user has permission to run it (add user to docker group: `usermod -aG docker $USER`).
