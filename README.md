# Morphlyca Frontend

Frontend aplikasi Morphlyca - platform AI untuk face swapping dan image processing dengan teknologi Next.js dan integrasi PrimeAuth.

**🌐 Production URL:** https://morphlyca.meetaza.com

## � About Project

Morphlyca adalah platform AI yang memungkinkan pengguna untuk melakukan face swapping dan image processing menggunakan teknologi machine learning. Frontend ini dibangun dengan:

- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type safety dan better development experience  
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern component library
- **PrimeAuth** - Authentication service integration
- **Docker** - Containerized deployment

### Features
- 🔐 **Authentication** - Login dengan PrimeAuth
- 👤 **User Management** - Admin panel untuk manage users
- 🎨 **Face Swapping** - AI-powered face swap functionality
- 📱 **Responsive Design** - Mobile-friendly interface
- 🖼️ **Media Library** - File management dengan MinIO integration
- 📊 **Analytics** - Job tracking dan user analytics
- ⚙️ **Admin Dashboard** - Complete admin management system

## � Deployment

Aplikasi ini menggunakan Docker image yang sudah di-build dan tersedia di Docker Hub.

### Prerequisites
- Docker & Docker Compose
- File `.env.production` dengan konfigurasi yang sesuai

### Quick Deploy

1. **Clone repository**
```bash
git clone https://github.com/meetaza/morphlyca-fe.git
cd morphlyca-fe
```

2. **Start application**
```bash
docker-compose up -d
```

3. **Update ke versi terbaru**
```bash
docker-compose pull
docker-compose up -d
```

Aplikasi akan berjalan di port 3001.

## 🔧 Environment Configuration

File `.env.production` berisi konfigurasi:

```bash
# API URLs
NEXT_PUBLIC_API_URL=https://api.morphlyca.meetaza.com
NEXT_PUBLIC_FRONTEND_URL=https://morphlyca.meetaza.com

# PrimeAuth Configuration
NEXT_PUBLIC_PRIMEAUTH_AUTH_SERVICE_URL=https://api.primeauth.meetaza.com/auth
NEXT_PUBLIC_PRIMEAUTH_REALM_ID=7e4cb28a-decc-4300-aea8-1b3c091ccbfe
NEXT_PUBLIC_PRIMEAUTH_CLIENT_ID=primeauth-MorphlycaDev
NEXT_PUBLIC_PRIMEAUTH_REDIRECT_URI=http://morphlyca.meetaza.com/auth/callback

# MinIO Storage
S3_ENDPOINT=http://192.168.210.14:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
NEXT_PUBLIC_MINIO_PUBLIC_BASE=http://192.168.210.14:9000
```

## 🏗️ Development

### Local Development Setup

1. **Install dependencies**
```bash
npm install
```

2. **Copy environment file**
```bash
cp .env.example .env.local
```

3. **Run development server**
```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin dashboard pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   └── login/          # Login page
├── components/         # Reusable components
│   ├── admin/          # Admin-specific components
│   └── ui/             # UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── middleware.ts       # Next.js middleware
```

## 🔧 Management Commands

### Production Management
```bash
# Start services
docker-compose up -d

# Stop services  
docker-compose down

# View logs
docker-compose logs -f

# Update to latest version
docker-compose pull
docker-compose up -d

# Restart specific service
docker-compose restart morphlyca-frontend
```

### Monitoring
```bash
# Check container status
docker ps

# Check logs
docker logs morphlyca-frontend

# Monitor resources
docker stats
```

## 🛠️ Technology Stack

- **Frontend Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI components
- **Authentication:** PrimeAuth integration
- **State Management:** React hooks + Context API
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Deployment:** Docker containers
- **Storage:** MinIO integration for file management

## 📞 Support

### Health Check
```bash
# Check application health
curl https://morphlyca.meetaza.com/api/health
```

### Common Issues
- **Container won't start:** Check logs with `docker-compose logs -f`
- **Authentication issues:** Verify PrimeAuth configuration in environment variables
- **File upload issues:** Check MinIO connectivity and credentials

---

**🚀 Morphlyca Frontend - AI-Powered Face Swapping Platform**
