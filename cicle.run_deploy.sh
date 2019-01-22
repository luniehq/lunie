#!/usr/bin/env bash
set -xeuo pipefail

# TODO: region should be ENV determined
aws s3 sync ${CIRCLE_ARTIFACTS}/dist/ ${AWS_S3_BUCKET_VOYAGER} --delete --region eu-central-1 > /dev/null

# aws cloudfront create-invalidation --distribution-id ${AWS_DISTRIBUTION_ID_VOYAGER} --paths '/*'