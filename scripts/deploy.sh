#!/bin/bash

# Global Variables
STACK_NAME="PetShopApiStack"
TEMPLATE_FILE="./infrastructure/template.yaml"
S3_BUCKET="pet-shop-api-deployment-bucket"
TEMPLATE_URL="https://$S3_BUCKET.s3.amazonaws.com/infrastructure/template.yaml"
LAMBDA_OUTPUT_DIR="zipped-lambdas"
DIR="$(pwd)"
ENDPOINT=""
CAPABILITIES="--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND"
ROLE_ARN=""  # Fill this in or dynamically obtain it
ENVIRONMENT=$1

function aws_cli() {
  if [[ -z "$AWS_ENDPOINT_URL" ]]; then
    aws "$@"
  else
    aws --endpoint-url "$AWS_ENDPOINT_URL" "$@"
  fi
}

function create_s3_bucket() {
    if ! aws_cli s3api head-bucket --bucket "$S3_BUCKET" &>/dev/null; then
        aws_cli s3 mb "s3://$S3_BUCKET" || exit 1
    fi
}

function upload_to_s3() {
    aws_cli s3 cp "$DIR/$LAMBDA_OUTPUT_DIR" "s3://$S3_BUCKET/$LAMBDA_OUTPUT_DIR/$ENVIRONMENT" --recursive --exclude "*" --include "*.zip" || exit 1
    aws_cli s3 cp ./infrastructure/ s3://$S3_BUCKET/ --recursive --exclude "*" --include "*.yaml" || exit 1
}

function handle_stack() {
    if aws_cli cloudformation describe-stacks --stack-name "$STACK_NAME" &>/dev/null; then
        echo "Stack already exists. Updating..."
        aws_cli cloudformation update-stack --stack-name "$STACK_NAME" --template-body file://"$TEMPLATE_FILE" --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" $1 || exit 1
        aws_cli cloudformation wait stack-update-complete --stack-name "$STACK_NAME" || exit 1
    else
        echo "Creating stack..."
        aws_cli cloudformation create-stack --stack-name "$STACK_NAME" --template-body file://"$TEMPLATE_FILE" --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" $1 || exit 1
        aws_cli cloudformation wait stack-create-complete --stack-name "$STACK_NAME" || exit 1
    fi
}

function update_lambda_code_from_s3() {
    local ZIP_FILE_NAME=$1
    # Extracting the base name of the file without the extension to get the Lambda name part
    local LAMBDA_NAME_PART=$(basename "$ZIP_FILE_NAME" .zip)

    # Construct the Lambda function name based on your naming convention
    local FUNCTION_NAME="pet-shop-api-${LAMBDA_NAME_PART}-${ENVIRONMENT}"

    local S3_KEY_PATH="$LAMBDA_OUTPUT_DIR/$ENVIRONMENT/$ZIP_FILE_NAME"

    echo "Updating Lambda: $FUNCTION_NAME from S3 Key: $S3_KEY_PATH"

    aws_cli lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --s3-bucket "$S3_BUCKET" \
        --s3-key "$S3_KEY_PATH" || exit 1
}

# Check for Environment Argument
if [[ -z "$ENVIRONMENT" ]]; then
  echo "Environment argument is missing. Usage: ./deploy.sh <local|dev|prod>"
  exit 1
fi

# Set Environment Specific Variables
case $ENVIRONMENT in
    local)
        ENDPOINT="http://localhost:4566"
        CAPABILITIES=""
        export AWS_ENDPOINT_URL="$ENDPOINT"
        ;;
    dev|prod)
        unset AWS_ENDPOINT_URL
        ;;
    *)
        echo "Invalid environment. Allowed values are local, dev, or prod."
        exit 1
        ;;
esac

echo "Starting deployment for $ENVIRONMENT environment..."
create_s3_bucket
#upload_to_s3
handle_stack "$CAPABILITIES"

for ZIP_FILE in $DIR/$LAMBDA_OUTPUT_DIR/*.zip; do
    update_lambda_code_from_s3 "$(basename "$ZIP_FILE")"
done

echo "Deployment for $ENVIRONMENT environment is complete."
