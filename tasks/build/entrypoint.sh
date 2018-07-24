#!/bin/sh
git clone /mnt/.git .
git checkout $COMMIT
yarn install
ln --symbolic /mnt/builds

# electron-packager can't handle the symbolic link
rm app/networks
cp --recursive builds/Gaia/networks app/

node tasks/build/build.js "$@"
