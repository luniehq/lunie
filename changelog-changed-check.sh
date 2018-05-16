branch=$CIRCLE_BRANCH || "$(git rev-parse --abbrev-ref HEAD)"
if [ "$(git diff --name-only develop $(git rev-parse --abbrev-ref HEAD) | grep -c CHANGELOG.md)" -ge 1 ]; then
    echo "CHANGELOG updated"
    exit 0;
else
    echo "!! CHANGELOG not updated !!"
    exit 1;
fi
