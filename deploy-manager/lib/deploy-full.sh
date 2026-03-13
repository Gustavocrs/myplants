#!/bin/bash

DIR=$1
SERVICE=$2
BRANCH=$3
REMOTE=$4

set -e

cd "$DIR"

echo "Sincronizando código"

git fetch $REMOTE $BRANCH
git reset --hard $REMOTE/$BRANCH

echo "Build container"

docker compose up -d --build $SERVICE

echo "Limpando imagens antigas"

docker image prune -f

echo "Logs iniciais"

docker compose logs --tail=40 $SERVICE
