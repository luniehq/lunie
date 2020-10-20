#!/bin/bash
SUBMODULE=$1

echo "Getting latest changes"
git stash
git fetch --all
echo "Checking out develop"
git checkout origin/develop -B develop
git pull
echo "Checking out the release-${SUBMODULE} branch"
git checkout origin/release-$SUBMODULE -B release-$SUBMODULE
git pull
echo "Merging with master"
git merge origin/master
echo "Merging with develop"
git merge origin/develop
echo "Pushing to origin"
git push
git stash pop
