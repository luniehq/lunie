if [ "$(git diff --name-only origin/develop | grep -c CHANGELOG.md)" -ge 1 ]; then
    echo "CHANGELOG updated"
    exit 0;
else
    echo "!! CHANGELOG not updated !!"
    exit 1;
fi
