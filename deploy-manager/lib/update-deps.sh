#!/bin/bash

DIR=$1
BRANCH=$2
REMOTE=$3

set -e

cd "$DIR"

npx npm-check-updates -u

npm install

npm run build

git add package.json package-lock.json

git commit -m "chore: update dependencies"

git push $REMOTE $BRANCH
