#!/usr/bin/env bash
# Runs on the VPS, called by the GitHub Actions deploy job:
#   echo "$GHCR_TOKEN" | ssh deploy@host 'bash ~/elimarket-deploy/deploy.sh <image> <ghcr-user>'
# Pulls <image>, swaps the running container, checks it answers, and rolls
# back to the previous image if it does not.
set -euo pipefail

IMAGE="${1:?usage: deploy.sh <image> [ghcr-user]}"
GHCR_USER="${2:-}"
DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE=(docker compose -f "$DIR/docker-compose.prod.yml")
REPO="${IMAGE%:*}"
HEALTH_URL="http://127.0.0.1:3000/"

cd "$DIR"

if [ -n "$GHCR_USER" ] && [ ! -t 0 ]; then
  docker login ghcr.io -u "$GHCR_USER" --password-stdin >/dev/null
fi
docker pull -q "$IMAGE"
[ -n "$GHCR_USER" ] && docker logout ghcr.io >/dev/null || true

# Keep whatever is serving now (CI image or the old hand-built one) as the
# rollback target.
current="$(docker inspect elimarket-app-1 --format '{{.Image}}' 2>/dev/null || true)"
if [ -n "$current" ]; then
  docker tag "$current" "$REPO:previous"
fi

healthy() {
  for _ in $(seq 1 30); do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$HEALTH_URL" || true)"
    if [ "$code" -ge 200 ] && [ "$code" -lt 500 ]; then
      echo "health check: HTTP $code"
      return 0
    fi
    sleep 3
  done
  echo "health check failed (last HTTP ${code:-none})"
  return 1
}

echo "deploying $IMAGE"
IMAGE="$IMAGE" "${COMPOSE[@]}" up -d --remove-orphans

if healthy; then
  # Lets a manual `docker compose -f docker-compose.prod.yml up -d` here reuse it.
  echo "IMAGE=$IMAGE" > "$DIR/.env"
  # Keep the current and previous tags plus the two newest builds; drop the rest.
  docker images "$REPO" --format '{{.Repository}}:{{.Tag}}' \
    | grep -vE ":(previous|latest)$" | grep -vF "$IMAGE" | tail -n +3 \
    | xargs -r docker rmi >/dev/null 2>&1 || true
  echo "deployed $IMAGE"
else
  "${COMPOSE[@]}" logs --tail 80 app || true
  if [ -n "$current" ]; then
    echo "rolling back to previous image"
    IMAGE="$REPO:previous" "${COMPOSE[@]}" up -d
    healthy || echo "rollback is not answering either — check the server"
  fi
  exit 1
fi
