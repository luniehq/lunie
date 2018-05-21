#!/bin/sh
set -o errexit

git clone /mnt/.git .

# Use the specified commit of Voyager.
git checkout "$1"
shift

ln --symbolic /mnt/builds
yarn install
node tasks/build/entrypoint2.js "$@"
