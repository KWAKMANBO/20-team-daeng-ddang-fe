#!/bin/bash
set -euo pipefail

REGION="ap-northeast-2"
DEPLOY_DIR="/opt/frontend"
LOG_FILE="/var/log/frontend-deploy.log"

exec > >(tee -a "$LOG_FILE") 2>&1
echo "=== FE Deploy Start: $(date) ==="

mkdir -p "${DEPLOY_DIR}" && cd "${DEPLOY_DIR}"

# 1. S3에서 docker-compose.yml 다운로드
aws s3 cp "s3://daeng-map/fe/prod/docker-compose.yml" ./docker-compose.yml

# 2. SSM에서 Docker 이미지 태그 읽기
export DOCKER_IMAGE=$(aws ssm get-parameter \
  --name "/daeng-map/fe/docker-image" \
  --query "Parameter.Value" --output text --region "${REGION}")
echo "Successfully retrieved DOCKER_IMAGE: ${DOCKER_IMAGE}"

# 3. SSM에서 Docker Hub 인증 정보 읽기
DOCKERHUB_USERNAME=$(aws ssm get-parameter \
  --name "/daeng-map/fe/dockerhub-username" \
  --query "Parameter.Value" --output text --region "${REGION}")
echo "Successfully retrieved DOCKERHUB_USERNAME"

DOCKERHUB_TOKEN=$(aws ssm get-parameter \
  --name "/daeng-map/fe/dockerhub-token" \
  --with-decryption \
  --query "Parameter.Value" --output text --region "${REGION}")
echo "Successfully retrieved DOCKERHUB_TOKEN"

# 4. SSM에서 런타임 시크릿 읽기
export NAVER_MAP_CLIENT_SECRET=$(aws ssm get-parameter \
  --name "/daeng-map/fe/naver-map-secret" \
  --with-decryption \
  --query "Parameter.Value" --output text --region "${REGION}")
echo "Successfully retrieved NAVER_MAP_CLIENT_SECRET"

export REDIS_URL=$(aws ssm get-parameter \
  --name "/daeng-map/fe/redis-url" \
  --with-decryption \
  --query "Parameter.Value" --output text --region "${REGION}")
echo "Successfully retrieved REDIS_URL"

# 5. Docker Hub 로그인 & 이미지 Pull
echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin
docker pull "${DOCKER_IMAGE}"

# 6. 컨테이너 실행
docker compose up -d

# 7. 정리
docker logout
echo "=== FE Deploy Complete: $(date) ==="
