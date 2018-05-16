if [ "$(git diff --name-only develop billy/672-help-on-sign-in | grep -c CHANGELOG.md)" -ge 1 ]; then
    echo "CHANGELOG updated"
    exit 0;
else
    echo "!! CHANGELOG not updated !!"
    exit 1;
fi
