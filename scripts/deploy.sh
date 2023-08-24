#!/bin/bash

trap "echo 'Script interrupted'; exit" INT

# Global Variables
DIR="$(pwd)"
ENVIRONMENT=$1
STACK_NAME="PetShopApiStack-$ENVIRONMENT"
TEMPLATE_FILE="./infrastructure/template.yaml"
S3_BUCKET="pet-shop-api-deployment-bucket"
LAMBDA_OUTPUT_DIR="zipped-lambdas"


function print_separator() {
    echo "================== $1 =================="
}

# Define AWS CLI command
function aws_cli() {
  if [[ -z "$AWS_ENDPOINT_URL" ]]; then
    aws "$@" > /dev/null
  else
    aws --endpoint-url "$AWS_ENDPOINT_URL" "$@" > /dev/null
  fi
}

# Ensure the S3 bucket exists, or create it
function create_s3_bucket() {
    if ! aws_cli s3api head-bucket --bucket "$S3_BUCKET"; then
        echo "Creating S3 bucket..."
        aws_cli s3 mb "s3://$S3_BUCKET" || { echo "Failed to create bucket."; exit 1; }
        echo "S3 bucket created successfully."
    else
        echo "S3 bucket already exists."
    fi
}

# Upload lambda zip files and infrastructure templates to S3
function upload_to_s3() {
    aws_cli s3 cp "$DIR/$LAMBDA_OUTPUT_DIR" "s3://$S3_BUCKET/$LAMBDA_OUTPUT_DIR/$ENVIRONMENT" --recursive --exclude "*" --include "*.zip" || { echo "Failed to upload zipped lambdas."; exit 1; }
    aws_cli s3 cp ./infrastructure/ s3://$S3_BUCKET/ --recursive --exclude "*" --include "*.yaml" || { echo "Failed to upload infrastructure files."; exit 1; }
    echo "Files uploaded to S3 successfully."
}

# Handle CloudFormation Stack
function handle_stack() {
    if aws_cli cloudformation describe-stacks --stack-name "$STACK_NAME"; then
        echo "Stack already exists. Updating..."
        aws_cli cloudformation update-stack --stack-name "$STACK_NAME" --template-body file://"$TEMPLATE_FILE" --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" $1 || { echo "Failed to update stack."; exit 1; }
        echo "Waiting for stack to update..."
        aws_cli cloudformation wait stack-update-complete --stack-name "$STACK_NAME" || { echo "Stack update failed."; exit 1; }
        echo "Stack updated successfully."
    else
        echo "Creating stack..."
        aws_cli cloudformation create-stack --stack-name "$STACK_NAME" --template-body file://"$TEMPLATE_FILE" --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" $1 || { echo "Failed to create stack."; exit 1; }
        echo "Waiting for stack to be created..."
        aws_cli cloudformation wait stack-create-complete --stack-name "$STACK_NAME" || { echo "Stack creation failed."; exit 1; }
        echo "Stack created successfully."
    fi
}

# Update Lambda code based on the uploaded zip files
function update_lambda_code_from_s3() {
    for ZIP_FILE in $DIR/$LAMBDA_OUTPUT_DIR/*.zip; do
        local LAMBDA_NAME_PART=$(basename "$ZIP_FILE" .zip)
        local FUNCTION_NAME="pet-shop-api-${LAMBDA_NAME_PART}-${ENVIRONMENT}"
        local S3_KEY_PATH="$LAMBDA_OUTPUT_DIR/$ENVIRONMENT/$(basename "$ZIP_FILE")"
        echo "Updating Lambda: $FUNCTION_NAME from S3 Key: $S3_KEY_PATH"
        aws_cli lambda update-function-code --function-name "$FUNCTION_NAME" --s3-bucket "$S3_BUCKET" --s3-key "$S3_KEY_PATH" || { echo "Failed to update function code for $FUNCTION_NAME"; exit 1; }
        echo "Lambda $FUNCTION_NAME updated successfully."
    done
}

# Main function to orchestrate the deployment
function main() {
    # Check for Environment Argument
    if [[ -z "$ENVIRONMENT" ]]; then
        echo "Environment argument is missing. Usage: ./deploy.sh <local|dev|prod>"
        exit 1
    fi

    case $ENVIRONMENT in
        local)
            export AWS_ENDPOINT_URL="http://localhost:4566"
            local capabilities=""
            ;;
        dev|prod)
            local capabilities="--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND"
            ;;
        *)
            echo "Invalid environment. Allowed values are local, dev, or prod."
            exit 1
            ;;
    esac

    print_separator "Deploying to $ENVIRONMENT environment"
    print_separator "Checking S3 bucket"
    create_s3_bucket
    print_separator "Uploading to S3"
    upload_to_s3
    print_separator "CloudFormation Stack"
    handle_stack "$capabilities"
    print_separator "Updating Lambdas"
    update_lambda_code_from_s3
    print_separator "Complete"
    echo "Deployment for $ENVIRONMENT environment is complete."
}

# Start the script
main
