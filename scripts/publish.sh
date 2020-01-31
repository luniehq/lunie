if git describe --exact-match --tags HEAD $1 >/dev/null 2>&1
then
    echo "Publishing"
    git config user.email "bot@lunie.io"
    git config user.name "MergeBack Lunie Bot"
    git remote add bot https://${GIT_BOT_TOKEN}@github.com/luniehq/lunie.git
    git push origin develop:master
else
    echo "No tag found so not publishing"
fi