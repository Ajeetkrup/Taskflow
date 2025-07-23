#!/bin/bash
set -e

echo "Building TaskFlow Docker images..."

export DOCKER_USERNAME=ajeetkrup1234

# Check if DOCKER_USERNAME is set
if [ -z "$DOCKER_USERNAME" ]; then
    echo "Error: DOCKER_USERNAME environment variable is not set"
    echo "Please set it with: export DOCKER_USERNAME=your-dockerhub-username"
    exit 1
fi

# Login to Docker Hub
echo "Logging in to Docker Hub..."
docker login

# Build and push services
services=("user-service" "task-service" "analytics-service" "notification-service")

for service in "${services[@]}"; do
    echo "Building $service..."
    docker build -t $DOCKER_USERNAME/taskflow-$service:latest ./services/$service/
    
    # Also tag with just taskflow prefix for local compatibility
    docker tag $DOCKER_USERNAME/taskflow-$service:latest taskflow/$service:latest
    
    # Push to Docker Hub
    echo "Pushing $service to Docker Hub..."
    docker push $DOCKER_USERNAME/taskflow-$service:latest
done

# Build and push frontend
echo "Building frontend..."
docker build -t $DOCKER_USERNAME/taskflow-frontend:latest ./frontend/

# Also tag with just taskflow prefix for local compatibility
docker tag $DOCKER_USERNAME/taskflow-frontend:latest taskflow/frontend:latest

# Push to Docker Hub
echo "Pushing frontend to Docker Hub..."
docker push $DOCKER_USERNAME/taskflow-frontend:latest

echo "All images built and pushed successfully to Docker Hub!"
echo "Images available at:"
echo "- $DOCKER_USERNAME/taskflow-user-service:latest"
echo "- $DOCKER_USERNAME/taskflow-task-service:latest"
echo "- $DOCKER_USERNAME/taskflow-analytics-service:latest"
echo "- $DOCKER_USERNAME/taskflow-notification-service:latest"
echo "- $DOCKER_USERNAME/taskflow-frontend:latest"