#!/bin/bash
# Script to build and test AccessLens Docker container locally

echo "Building Docker image..."
docker build -t accesslens:local .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "To run the container:"
    echo "docker run -p 3000:3000 --env-file .env.local accesslens:local"
    echo ""
    echo "Or with environment variables inline:"
    echo "docker run -p 3000:3000 -e MONGODB_URI=your_uri -e MONGODB_DB=accesslens_dev -e SESSION_SECRET=your_secret accesslens:local"
else
    echo "❌ Build failed!"
    exit 1
fi

