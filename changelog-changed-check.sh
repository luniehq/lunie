currentBranch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$currentBranch" = "develop" ]; then
    echo "This branch is the develop branch. Checks on updating the changelog are omitted."
    exit 0;
fi
if [ "$(git diff --name-only origin/develop | grep -c CHANGELOG.md)" -ge 1 ]; then
    echo "CHANGELOG updated"
    exit 0;
else
    echo "!! CHANGELOG not updated !!"
    exit 1;
fi
