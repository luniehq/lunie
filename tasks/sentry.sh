# install sentry cli
echo "Installing and configuring sentry cli"
curl -L -o sentry-cli https://github.com/getsentry/sentry-cli/releases/download/1.40.0/sentry-cli-Linux-`arch`
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