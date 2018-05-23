#!/bin/bash

echo -e "\033[0;32mRunning deploy script...\033[0m"
set -e # terminate when anything fails

### INIT PUBLIC (master)

echo -e "\033[0;32mInitializing public/...\033[0m"

if [ ! -d "dist_master" ]; then
    mkdir dist_master
    cd dist_master
    git init
    git remote add origin git@github.com:cosmos/cosmos.github.io.git
    cd ..
fi

### DEPLOY PUBLIC (master)

echo -e "\033[0;32mPushing compiled files to Github...\033[0m"

npm run build
rm -rf dist_master/*
cp -r dist/* dist_master/
cd dist_master
mv static/CNAME CNAME
git add -A
git commit -m "deploying website"
git push origin master --force
