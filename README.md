# Morphlyca Frontend

Next.js frontend application for Morphlyca platform with PrimeAuth integration and Docker support.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Clone & Run
```bash
git clone https://github.com/meetaza/morphlyca-fe.git
cd morphlyca-fe
```

#### Development Mode
```bash
# Linux/macOS
./docker.sh dev

# Windows
.\docker.bat dev

# Windows (jika ada masalah permission)
.\docker.bat dev-simple
# atau langsung:
docker-compose -f docker-compose.simple.yml up --build
```

#### Production Mode
```bash
# Linux/macOS
./docker.sh prod

# Windows
.\docker.bat prod
```

**Frontend URL:** http://localhost:3001

## 🖥️ VM Deployment Guide

### 1. Server Requirements
- **OS:** Ubuntu 20.04+ / CentOS 7+ / RHEL 8+
- **RAM:** Minimum 2GB (Recommended 4GB+)
- **CPU:** 2 cores minimum
- **Storage:** 10GB+ free space
- **Ports:** 3001 (frontend), 3000 (backend), 9000-9001 (MinIO), 5432 (PostgreSQL), 6379 (Redis)

### 2. Install Docker on VM

#### Ubuntu/Debian:
```bash
# Update package index
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

#### CentOS/RHEL:
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

**Logout and login again** after adding user to docker group.

### 3. Deploy Application

```bash
# Clone repository
git clone https://github.com/meetaza/morphlyca-fe.git
cd morphlyca-fe

# Copy environment file
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

### 4. Configure Environment Variables

Update `.env.local` with your VM's IP address:

```bash
# Replace localhost with your VM's IP address
NEXT_PUBLIC_API_URL=http://YOUR_VM_IP:3000
NEXT_PUBLIC_FRONTEND_URL=http://YOUR_VM_IP:3001
NEXT_PUBLIC_PRIMEAUTH_REDIRECT_URI=http://YOUR_VM_IP:3000/auth/callback

# MinIO public URL
NEXT_PUBLIC_MINIO_PUBLIC_BASE=http://YOUR_VM_IP:9000

# S3/MinIO configuration
S3_ENDPOINT=http://YOUR_VM_IP:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_OUTPUT_BUCKET=facefusion-output

# PrimeAuth configuration (keep as is)
NEXT_PUBLIC_PRIMEAUTH_AUTH_SERVICE_URL=https://api.primeauth.meetaza.com/auth
NEXT_PUBLIC_PRIMEAUTH_REALM_ID=8930ef74-b6cf-465a-9a74-8f9cc591c3e3
NEXT_PUBLIC_PRIMEAUTH_CLIENT_ID=primeauth-admin
NEXT_PUBLIC_PRIMEAUTH_TOKEN_URL=https://api.primeauth.meetaza.com/auth/realms/8930ef74-b6cf-465a-9a74-8f9cc591c3e3/protocol/openid-connect/token
```

### 5. Start Services

```bash
# Start production environment
./docker.sh prod-detached

# Or for development
./docker.sh dev-detached
```

### 6. Configure Firewall

#### Ubuntu (UFW):
```bash
sudo ufw allow 3001/tcp  # Frontend
sudo ufw allow 3000/tcp  # Backend (if needed)
sudo ufw allow 9000/tcp  # MinIO API
sudo ufw allow 9001/tcp  # MinIO Console
sudo ufw reload
```

#### CentOS/RHEL (firewalld):
```bash
sudo firewall-cmd --permanent --add-port=3001/tcp  # Frontend
sudo firewall-cmd --permanent --add-port=3000/tcp  # Backend
sudo firewall-cmd --permanent --add-port=9000/tcp  # MinIO API
sudo firewall-cmd --permanent --add-port=9001/tcp  # MinIO Console
sudo firewall-cmd --reload
```

### 7. Verify Deployment

```bash
# Check containers status
docker ps

# Check logs
./docker.sh logs

# Test frontend
curl http://YOUR_VM_IP:3001
```

**Access application:** http://YOUR_VM_IP:3001

## 🔧 Management Commands

### Application Management
```bash
# Start services
./docker.sh prod-detached

# Stop services
./docker.sh stop

# View logs
./docker.sh logs

# Restart services
./docker.sh stop && ./docker.sh prod-detached

# Update application
git pull origin main
./docker.sh stop
./docker.sh clean
./docker.sh prod-detached
```

### Monitoring
```bash
# Check container status
docker ps

# Check resource usage
docker stats

# Check logs for specific service
docker logs morphlyca-frontend
docker logs morphlyca-backend
docker logs morphlyca-minio
```

### Backup & Restore
```bash
# Backup volumes
docker run --rm -v morphlyca-fe_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
docker run --rm -v morphlyca-fe_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v morphlyca-fe_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
docker run --rm -v morphlyca-fe_minio_data:/data -v $(pwd):/backup alpine tar xzf /backup/minio-backup.tar.gz -C /data
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo netstat -tlnp | grep :3001

# Kill process using port
sudo kill -9 <PID>
```

#### 2. Permission Denied
```bash
# Fix Docker permissions
sudo chown -R $USER:$USER /var/run/docker.sock
sudo systemctl restart docker
```

#### 3. Out of Disk Space
```bash
# Clean Docker resources
docker system prune -a
docker volume prune
```

#### 4. Container Won't Start
```bash
# Check logs
./docker.sh logs

# Rebuild containers
./docker.sh clean
./docker.sh prod-detached
```

#### 5. ESLint/TypeScript Build Errors
```bash
# Jika build gagal karena ESLint errors:

# Solusi 1: Build sudah dikonfigurasi untuk ignore errors
# File next.config.ts sudah diset untuk ignoreDuringBuilds: true

# Solusi 2: Jika masih error, cek logs
docker logs container_name

# Solusi 3: Build dengan skip validation
docker build --build-arg SKIP_ENV_VALIDATION=1 .
```

#### 6. Windows Permission Issues
```powershell
# Jika error "Access is denied" di Windows:

# Solusi 1: Jalankan PowerShell sebagai Administrator
.\docker.bat dev-simple

# Solusi 2: Gunakan docker-compose langsung
docker-compose -f docker-compose.simple.yml up --build

# Solusi 3: Fix Docker Desktop File Sharing
# Buka Docker Desktop → Settings → Resources → File Sharing
# Add C:\Users\[USERNAME]\Documents

# Solusi 4: Fix folder permission
icacls "C:\Users\Asyam\Documents\morphlyca-fe" /grant:r %USERNAME%:F
```

#### 6. Can't Access from External IP
- Check firewall settings
- Verify environment variables have correct IP
- Ensure Docker containers are binding to 0.0.0.0

### Health Checks
```bash
# Frontend health
curl http://YOUR_VM_IP:3001/api/health

# MinIO health
curl http://YOUR_VM_IP:9000/minio/health/live
```

## 📋 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://YOUR_VM_IP:3001 | Main application |
| Backend API | http://YOUR_VM_IP:3000 | Backend services |
| MinIO Console | http://YOUR_VM_IP:9001 | File storage admin |
| MinIO API | http://YOUR_VM_IP:9000 | File storage API |

## 🔐 Default Credentials

### MinIO
- **Username:** minioadmin
- **Password:** minioadmin

**⚠️ Change these in production!**

## 📞 Support

### Logs Location
- Application logs: `./docker.sh logs`
- System logs: `/var/log/docker/`

### Maintenance
- Update: `git pull && ./docker.sh stop && ./docker.sh clean && ./docker.sh prod-detached`
- Backup: See backup commands above
- Monitor: `docker stats` and `docker ps`

---

**🚀 Happy Deploying!**
