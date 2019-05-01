#!/bin/sh

currentBranch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$currentBranch" = "master" ] || [ "$currentBranch" = "release" ] || [ "$currentBranch" = "develop" ]; then
    echo "This branch is the develop branch. Checks on updating the PENDING log are omitted."
    exit 0;
fi
if [ "$(git diff --name-only origin/develop | grep -c changes/)" -ge 1 ]; then
    echo "Changes added"
    exit 0;
else
    echo "!! Changes not added. Please run `yarn changelog` !!"
    exit 1;
fi
