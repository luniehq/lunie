#!/bin/bash
COMMIT_MESSAGE=$(git log --format=%B -n 1)
if [[ $COMMIT_MESSAGE == "release-"* || $COMMIT_MESSAGE == "[Simsala] automatic release"* ]]
then
    echo "Publishing"
    git config user.email "bot@lunie.io"
    git config user.name "MergeBack Lunie Bot"
    git remote add bot https://${GIT_BOT_TOKEN}@github.com/luniehq/lunie.git
    git push origin develop:master
else
    echo "No release detected, so not publishing"
fi
