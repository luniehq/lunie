#!/bin/bash
COMMIT_MESSAGE=$(git log --format=%B -n 1)
if [[ $COMMIT_MESSAGE == "release-"* || $COMMIT_MESSAGE == "[Simsala] automatic release"* ]]
then
    echo "Publishing"
    git config user.email "bot@lunie.io"
    git config user.name "MergeBack Lunie Bot"
    git remote add bot https://${GIT_BOT_TOKEN}@github.com/luniehq/lunie.git
    git push origin develop:master

    # pushing sourcemaps only on release to sentry
    # need to build script
    yarn install
    yarn build
    # install sentry cli
    echo "Installing and configuring sentry cli"
    curl -L -o sentry-cli https://github.com/getsentry/sentry-cli/releases/download/1.40.0/sentry-cli-Linux-x86_64
    chmod u+x sentry-cli
    ./sentry-cli --version
    export SENTRY_AUTH_TOKEN=${SENTRY_TOKEN}
    export SENTRY_ORG=lunie
    export SENTRY_PROJECT=frontend
    VERSION=$(./sentry-cli releases propose-version)
    echo "Creating release"
    ./sentry-cli --url ${SENTRY_URL} releases new $VERSION
    echo "Setting release commits"
    ./sentry-cli releases set-commits --auto $VERSION
    echo "Link deploy to release"
    ./sentry-cli releases deploys $VERSION new -e 'production'
    echo "Uploading source maps"
    ./sentry-cli releases files $VERSION upload-sourcemaps dist/js/ --rewrite --url-prefix '~/dist/js'
    echo "Finalizing release"
    ./sentry-cli releases finalize $VERSION
else
    echo "No release detected, so not publishing"
fi
