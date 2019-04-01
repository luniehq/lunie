#!/bin/sh
git clone /mnt/.git .
git checkout $COMMIT
yarn install
ln --symbolic /mnt/builds
node tasks/build/build.js "$@"
