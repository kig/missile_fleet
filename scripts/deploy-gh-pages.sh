#!/usr/bin/env bash
set -euo pipefail

npm run build

rm -rf deploy
mkdir deploy
cd deploy

cp -a ../.git .git
git reset --hard
git checkout gh-pages
git pull

rm -r *
cp -a ../dist/* .

git add .
git commit -am "Build: $(git show-ref main | head -1)"
git push

echo
echo "Deployed"
echo