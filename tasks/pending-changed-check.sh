#!/bin/sh

currentBranch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$currentBranch" = "master" ] || [ "$currentBranch" = "release" ] || [ "$currentBranch" = "develop" ]; then
    echo "This branch is the develop branch. Checks on updating the PENDING log are omitted."
    exit 0;
fi
if [ "$(git diff --name-only origin/develop | grep -c PENDING.md)" -ge 1 ]; then
    echo "PENDING updated"
    exit 0;
else
    echo "!! PENDING not updated !!"
    exit 1;
fi
