currentBranch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$currentBranch" = "master" ]; then
    eval 'node release.js'
fi