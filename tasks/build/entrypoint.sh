#!/bin/sh
git clone /mnt/.git .
git checkout $COMMIT
yarn install
ln --symbolic /mnt/builds
rm --force --recursive app/networks
ln --symbolic /mnt/networks
node tasks/build/build.js "$@"
