#!/bin/bash

DIR=$1
BRANCH=$2
REMOTE=$3

set -e

cd "$DIR"

npm install next@latest react@latest react-dom@latest
npm install -D eslint-config-next@latest

npm run build

git add package.json package-lock.json

git commit -m "chore: update next ecosystem"

git push $REMOTE $BRANCH
