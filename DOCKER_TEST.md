# Local Docker Testing Guide

## Prerequisites
1. **Start Docker Desktop** - Make sure Docker Desktop is running on Windows
2. **Create `.env.local`** - You'll need environment variables for the container

## Step 1: Build the Docker Image

```bash
docker build -t accesslens:local .
```

This will:
- Install all dependencies
- Build the Next.js application
- Create a production-ready image

## Step 2: Run the Container

### Option A: Using .env.local file
```bash
docker run -p 3000:3000 --env-file .env.local accesslens:local
```

### Option B: Using inline environment variables
```bash
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://localhost:27017 \
  -e MONGODB_DB=accesslens_dev \
  -e SESSION_SECRET=your-32-char-secret-change-in-production \
  -e SESSION_COOKIE_NAME=accesslens_session \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  accesslens:local
```

### Option C: Using MongoDB Atlas (cloud)
```bash
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net \
  -e MONGODB_DB=accesslens_prod \
  -e SESSION_SECRET=your-32-char-secret-change-in-production \
  -e SESSION_COOKIE_NAME=accesslens_session \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  accesslens:local
```

## Step 3: Test the Application

Once running, visit:
- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## Step 4: View Logs

```bash
# Find container ID
docker ps

# View logs
docker logs <container-id>

# Follow logs in real-time
docker logs -f <container-id>
```

## Step 5: Stop the Container

```bash
# Find container ID
docker ps

# Stop the container
docker stop <container-id>

# Remove the container
docker rm <container-id>
```

## Troubleshooting

### Build fails with "Cannot find module 'autoprefixer'"
- Make sure `package.json` includes `autoprefixer` in devDependencies
- Run `npm install` locally first to update `package-lock.json`

### Container exits immediately
- Check logs: `docker logs <container-id>`
- Verify environment variables are set correctly
- Ensure MongoDB connection string is valid

### Port 3000 already in use
- Use a different port: `docker run -p 3001:3000 ...`
- Or stop the process using port 3000

## Clean Up

```bash
# Remove the image
docker rmi accesslens:local

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune
```

