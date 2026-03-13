#!/bin/bash

DIR=$1
SERVICE=$2
BRANCH=$3
REMOTE=$4

set -e

cd "$DIR"

git pull $REMOTE $BRANCH

docker compose restart $SERVICE

docker compose logs --tail=40 $SERVICE
