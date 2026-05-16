# Cloudreve Deployment Guide

This guide outlines the steps to deploy a high-volume Cloudreve instance on a DigitalOcean Droplet.

## Droplet Specifications (Based on User Input)
- **Image**: Ubuntu 22.04 (LTS) x64
- **Region**: NYC1
- **Size**: 4GB RAM, 2 vCPUs (Recommended minimum for media processing)

## Deployment Steps

1.  **Create Droplet**: Use the DigitalOcean control panel or CLI to create a new droplet with the above specifications.
2.  **SSH Access**: Once the droplet is created, SSH into it using the provided IP and credentials.
3.  **Install Dependencies**:
    ```bash
    sudo apt update
    sudo apt install -y nginx mysql-server redis-server
    ```
4.  **Install PHP 8.1+ and Extensions**:
    ```bash
    sudo apt install -y php8.1 php8.1-{fpm,gd,curl,mbstring,mysql,zip,xml,redis,imagick}
    ```
5.  **Download Cloudreve**:
    ```bash
    wget https://github.com/cloudreve/Cloudreve/releases/latest/download/cloudreve.tar.gz
    tar -xzf cloudreve.tar.gz
    chmod +x ./cloudreve
    ```
6.  **Run Initial Setup**:
    ```bash
    ./cloudreve
    ```
    This will generate a temporary admin account. Note down the credentials.
7.  **Configure Systemd Service**:
    Create a systemd service file at `/etc/systemd/system/cloudreve.service`:
    ```ini
    [Unit]
    Description=Cloudreve
    Documentation=https://docs.cloudreve.org
    After=network.target
    Wants=network.target

    [Service]
    Type=simple
    User=www-data
    Group=www-data
    WorkingDirectory=/path/to/cloudreve
    ExecStart=/path/to/cloudreve/cloudreve
    Restart=on-abnormal
    RestartSec=5s
    KillMode=mixed

    StandardOutput=null
    StandardError=syslog

    [Install]
    WantedBy=multi-user.target
    ```
    Replace `/path/to/cloudreve` with the actual path. Then:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable cloudreve
    sudo systemctl start cloudreve
    ```
8.  **Configure Nginx as Reverse Proxy**:
    Create a new Nginx site configuration at `/etc/nginx/sites-available/cloudreve`:
    ```nginx
    server {
        listen 80;
        server_name your.droplet.ip; # Replace with your actual IP or domain

        location / {
            proxy_pass http://127.0.0.1:5212; # Default Cloudreve port
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```
    Enable the site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/cloudreve /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    ```
9.  **Configure Storage Policy**:
    - Access the Cloudreve admin panel using the temporary credentials.
    - Navigate to "Storage Policies" and configure a policy for local storage or S3-compatible storage.
    - For high-volume uploads, consider using "Direct Upload" to bypass the server for file transfers.
10. **Configure OAuth2 Application**:
    - In the Cloudreve admin panel, go to "OAuth2 Applications".
    - Create a new application for your GoddessPlatform instance.
    - Set the redirect URI to `https://your-goddess-platform-domain/api/cloudreve/oauth/callback`.
    - Note the Client ID and Client Secret for use in the `.env` file.

## Post-Deployment
- Secure the installation with SSL (e.g., Let's Encrypt).
- Regularly update Cloudreve and system packages.
- Monitor resource usage (CPU, RAM, Disk I/O) to ensure optimal performance.