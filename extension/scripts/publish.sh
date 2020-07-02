#!/bin/bash
COMMIT_MESSAGE=$(git log --format=%B -n 1)
if [[ $COMMIT_MESSAGE == "release-"* || $COMMIT_MESSAGE == "[Simsala] automatic release"* ]]
then
    echo "Publishing"
    git config pull.rebase false
    git config user.email "bot@lunie.io"
    git config user.name "Publish Lunie Bot"
    git remote add bot https://${GIT_BOT_TOKEN}@github.com/luniehq/lunie-browser-extension.git
    git checkout master
    git pull
    git merge --no-edit origin/develop
    git push
else
    echo "No release detected, so not publishing"
fi
