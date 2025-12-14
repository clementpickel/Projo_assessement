#!/bin/bash

# Configuration
REMOTE_USER="clement"
REMOTE_HOST="100.119.201.30"
REMOTE_PATH="/home/clement/projo"
LOCAL_IMAGE_BACKEND="projo-backend"
LOCAL_IMAGE_FRONTEND="projo-frontend"
DOCKER_REGISTRY="${REMOTE_USER}@${REMOTE_HOST}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building Docker images...${NC}"

# Build backend image
echo -e "${YELLOW}Building backend image...${NC}"
docker build -t ${LOCAL_IMAGE_BACKEND}:latest ./back/
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build backend image${NC}"
  exit 1
fi

# Build frontend image
echo -e "${YELLOW}Building frontend image...${NC}"
docker build -t ${LOCAL_IMAGE_FRONTEND}:latest ./frontend/
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build frontend image${NC}"
  exit 1
fi

echo -e "${GREEN}Images built successfully${NC}"

# Save images to tar files
echo -e "${YELLOW}Saving images to tar files...${NC}"
docker save ${LOCAL_IMAGE_BACKEND}:latest | gzip > ${LOCAL_IMAGE_BACKEND}.tar.gz
docker save ${LOCAL_IMAGE_FRONTEND}:latest | gzip > ${LOCAL_IMAGE_FRONTEND}.tar.gz

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to save images${NC}"
  exit 1
fi

echo -e "${GREEN}Images saved${NC}"

echo -e "${YELLOW}Creating directories on remote server...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
  mkdir -p ${REMOTE_PATH}
  mkdir -p ${REMOTE_PATH}/back
  mkdir -p ${REMOTE_PATH}/frontend
  echo "Directories created"
EOF

# Send images via scp
echo -e "${YELLOW}Sending images to ${REMOTE_HOST}...${NC}"

scp ${LOCAL_IMAGE_BACKEND}.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to send backend image${NC}"
  exit 1
fi

scp ${LOCAL_IMAGE_FRONTEND}.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to send frontend image${NC}"
  exit 1
fi

# Send docker-compose.yml and .env files

echo -e "${YELLOW}Sending docker-compose.yml and .env files...${NC}"
scp docker-compose.yml ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
scp back/.env ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/back/.env 2>/dev/null || echo "back/.env not found, skipping"
scp frontend/.env.prod ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/frontend/.env.prod 2>/dev/null || echo "frontend/.env.prod not found, skipping"
scp frontend/.env ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/frontend/.env 2>/dev/null || echo "frontend/.env not found, skipping"

echo -e "${GREEN}Files sent successfully${NC}"

# Load and run images on remote server
echo -e "${YELLOW}Loading images on remote server...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
  cd ${REMOTE_PATH}
  echo "Loading backend image..."
  docker load < ${LOCAL_IMAGE_BACKEND}.tar.gz
  echo "Loading frontend image..."
  docker load < ${LOCAL_IMAGE_FRONTEND}.tar.gz
  echo "Starting docker-compose..."
  docker-compose down 2>/dev/null || true
  docker-compose up -d
  echo "Checking container status..."
  docker-compose ps
EOF

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to load images or start containers on remote server${NC}"
  exit 1
fi

# Clean up local tar files
echo -e "${YELLOW}Cleaning up local tar files...${NC}"
rm ${LOCAL_IMAGE_BACKEND}.tar.gz ${LOCAL_IMAGE_FRONTEND}.tar.gz

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Containers are now running on ${REMOTE_HOST}${NC}"
