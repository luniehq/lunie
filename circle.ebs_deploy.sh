#!/usr/bin/env bash
set -euo pipefail
JQ="jq --raw-output --exit-status"
S3_PATH="s3://${S3_DEPLOY_BUCKET}/"
DOCKER_DEPLOY_FILE="${CIRCLE_BUILD_NUM}-${CIRCLE_PROJECT_REPONAME}.zip"

echo "Deploying to ${APPLICATION_ENV}"

configure_aws_cli(){
	aws --version
	aws configure set default.region ${AWS_REGION}
	aws configure set default.output json
}


push_ecr_image(){
    # copy the guy that clone the right hash and do all the magic as fetching by himself the S3 genesis file
    cp .aws/Dockerfile .
    # get our login and clean it a bit
    eval $(aws ecr get-login --region ${AWS_REGION} | sed -e "s/-e none//g" - )

    # tag with our current circleCi run (hash was OK but less readable, this is sequential so seems easier to read)
    docker tag $DOCKER_REPO_URL:$CIRCLE_BUILD_NUM $DOCKER_REPO_URL:latest

    # push new tag
    docker push $DOCKER_REPO_URL:$CIRCLE_BUILD_NUM

    # update latest tag to reference this version
    docker push $DOCKER_REPO_URL:latest
}


upload_s3_build_file() {
    # clean repo url
    DOCKER_ESCAPE_URL=`sed 's@\/@\\\/@g' <<< "$DOCKER_REPO_URL"`

    # create form the template a proper Dockerrun json by replacing the correct values
    sed -e "s/<BUILD_NO>/${CIRCLE_BUILD_NUM}/" -e "s/<DOCKER_REPO_URL>/${DOCKER_ESCAPE_URL}/" .aws/Dockerrun.aws.tpl.json > Dockerrun.aws.json

    # add all the extensions
    cp -r .aws/.ebextensions .

    # zip and push it to S3 ALWAYS to the same file, no jokes, just a static veriable in CircleCi env variable
    zip -r ${DOCKER_DEPLOY_FILE} .ebextensions Dockerrun.aws.json
    aws s3 cp ${DOCKER_DEPLOY_FILE} $S3_PATH --region=${AWS_REGION}
}

deploy_ebs() {
    # Create a version of the APPLIOCATION_NAME with the current biuild number as version. The source is the S3 file we know
    aws elasticbeanstalk create-application-version --region=${AWS_REGION} --application-name ${APPLICATION_NAME} \
      --version-label $CIRCLE_BUILD_NUM --source-bundle S3Bucket=${S3_DEPLOY_BUCKET},S3Key=${DOCKER_DEPLOY_FILE}

    # update and run, should be ok
    aws elasticbeanstalk update-environment --region=${AWS_REGION} --application-name ${APPLICATION_NAME} --environment-name ${APPLICATION_ENV} \
      --version-label $CIRCLE_BUILD_NUM
}

configure_aws_cli
push_ecr_image
upload_s3_build_file
# Export import of genesis is totally missing, STEP 2
# for now static S3 file with Genesis always the same for every node we want
deploy_ebs
