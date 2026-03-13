#!/bin/bash

DIR=$1
SERVICE=$2

cd "$DIR"

docker compose logs -f --tail=50 $SERVICE
