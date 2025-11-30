# AccessLens

Accessibility review platform for arenas, pools, rinks, parks, sidewalks, and businesses.

## Tech Stack

- **Frontend/API**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: MongoDB, custom auth with `iron-session` + `bcrypt`
- **Email**: Resend (for transactional emails)
- **Deployment**: Docker + Coolify

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd AccessLens
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: Database name
- `SESSION_SECRET`: A secure random string (min 32 characters)
- `SESSION_COOKIE_NAME`: Session cookie name (default: `accesslens_session`)
- `RESEND_API_KEY`: Resend API key (optional for MVP)
- `RESEND_FROM_EMAIL`: Email address for sending emails
- `NEXT_PUBLIC_APP_URL`: Your app URL

4. Initialize database indexes:
```bash
npx tsx scripts/initIndexes.ts
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Public routes
│   ├── (protected)/       # Protected routes
│   └── api/               # API routes
├── components/            # React components
│   ├── layout/            # Layout components
│   ├── places/            # Place-related components
│   ├── reviews/           # Review components
│   └── ui/                # Reusable UI components
├── lib/                   # Core libraries
│   ├── auth/              # Authentication helpers
│   ├── db/                # Database client
│   └── validation/        # Validation schemas
└── models/                # TypeScript interfaces
```

## Git Workflow

This project uses a simple branching model:

- `main`: Production branch (tagged releases only)
- `develop`: Integration branch
- `feature/*`: Feature branches

### Workflow

1. Create a feature branch from `develop`:
```bash
git checkout develop
git pull
git checkout -b feature/your-feature-name
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: your feature description"
```

3. Push and create a PR:
```bash
git push -u origin feature/your-feature-name
```

4. Merge PR into `develop`, then periodically merge `develop` → `main` with tags.

## Building for Production

### Docker Build

```bash
docker build -t accesslens .
docker run -p 3000:3000 --env-file .env.local accesslens
```

### Standalone Build

```bash
npm run build
npm start
```

## Deployment with Coolify

1. Connect your Git repository to Coolify
2. Set build type to "Dockerfile"
3. Configure all environment variables in Coolify UI
4. Deploy from `main` branch

## API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Places
- `GET /api/places` - List places (with optional filters)
- `POST /api/places` - Create new place (auth required)
- `GET /api/places/[id]` - Get place details

### Reviews
- `POST /api/places/[id]/reviews` - Create review (auth required)

## Features

- ✅ User authentication (email/password)
- ✅ Place creation and listing
- ✅ Place detail pages
- ✅ Review system
- ✅ User dashboard
- ✅ Accessibility filtering
- ✅ Responsive design
- ✅ Docker support

## Future Enhancements

- Rate limiting
- File uploads (S3/Cloudinary)
- Maps integration (Leaflet/Mapbox)
- Email notifications
- Search functionality
- Advanced filtering
- User profiles
- Admin panel

## License

MIT License - see LICENSE file for details

