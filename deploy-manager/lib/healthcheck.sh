#!/bin/bash

DIR=$1

cd "$DIR"

echo "Containers"

docker compose ps

echo ""

echo "Uso de recursos"

docker stats --no-stream
