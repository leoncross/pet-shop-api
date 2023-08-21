#!/bin/bash

set -e

# Global Variables
STACK_NAME="PetShopApiStack"
TEMPLATE_FILE="./infrastructure/template.yaml"
S3_BUCKET="pet-shop-api-deployment-bucket"
LAMBDA_OUTPUT_DIR="zipped-lambdas" # Variable: Output directory for zipped files
ENVIRONMENT=$1  # Set environment from script argument
DIR="$(pwd)"
ENDPOINT=""
CAPABILITIES="--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND"
NODE_VERSION="nodejs18.x"

function aws_cli() {
  if [[ -z "$AWS_ENDPOINT_URL" ]]; then
    aws "$@"
  else
    aws --endpoint-url "$AWS_ENDPOINT_URL" "$@"
  fi
}

function create_s3_bucket() {
    aws_cli s3 mb "s3://$S3_BUCKET" || true
}

function upload_to_s3() {
    cd "$DIR/$LAMBDA_OUTPUT_DIR" || exit
    aws_cli s3 cp . "s3://$S3_BUCKET/$LAMBDA_OUTPUT_DIR/$ENVIRONMENT" --recursive --exclude "*" --include "*.zip"
    cd "$DIR"
    aws_cli s3 cp ./infrastructure/ s3://$S3_BUCKET/ --recursive --exclude "*" --include "*.yaml"
}

function handle_stack() {
    # Try creating the CloudFormation stack
    CREATE_OUTPUT=$(aws_cli cloudformation create-stack --stack-name "$STACK_NAME" --template-body file://"$TEMPLATE_FILE" --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" $1 2>&1)

    # Check the response to see if the stack already exists
    if echo "$CREATE_OUTPUT" | grep -q "AlreadyExistsException"; then
        echo "Stack already exists. Updating..."

        # Try updating the stack
        UPDATE_OUTPUT=$(aws_cli cloudformation update-stack --stack-name "$STACK_NAME" --template-body file://"$TEMPLATE_FILE" --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" $1 2>&1)

        # If there are no changes in the update, AWS will return an error. We just echo a message and move on.
        if echo "$UPDATE_OUTPUT" | grep -q "No updates are to be performed"; then
            echo "No updates needed for CloudFormation stack."
        else
            echo "Error during stack update: $UPDATE_OUTPUT"
            exit 1
        fi

    elif echo "$CREATE_OUTPUT" | grep -q "ValidationError"; then
        # Handle validation errors during stack creation
        echo "Error during stack creation: $CREATE_OUTPUT"
        exit 1
    else
        echo "CloudFormation stack created successfully."
    fi
}




# Function to update Lambda functions to the latest version
function update_lambda_functions() {
  # Get the .zip filenames in the zipped-lambdas directory
  endpoints=($(ls "$DIR/$LAMBDA_OUTPUT_DIR" | grep '.zip'))

  for endpoint in "${endpoints[@]}"; do
    endpoint_name="${endpoint%.zip}"
    function_name="pet-shop-api-$endpoint_name-$ENVIRONMENT"

    # Try to update the Lambda function
    update_output=$(aws_cli lambda update-function-code \
      --function-name "$function_name" \
      --s3-bucket "$S3_BUCKET" \
      --s3-key "$LAMBDA_OUTPUT_DIR/$ENVIRONMENT/$endpoint" 2>&1)

    # If the update fails because the function doesn't exist, create it instead
    if echo "$update_output" | grep -q 'Function not found'; then
      # Assuming that the role for the Lambda function already exists
      role_arn="arn:aws:iam::291042150569:role/your-lambda-execution-role"

      aws_cli lambda create-function \
        --function-name "$function_name" \
        --runtime $NODE_VERSION \
        --role "$role_arn" \
        --handler "./src/index.handler" \
        --code S3Bucket="$S3_BUCKET",S3Key="$lambda_output_dir/$ENVIRONMENT/$endpoint" \
        --memory-size 128 \
        --timeout 15

      echo "Created Lambda function $function_name"
    else
      echo "Updated Lambda function $function_name"
    fi
  done
}

# Execution starts here
if [[ -z "$ENVIRONMENT" ]]; then
  echo "Environment argument is missing. Usage: ./deploy.sh <local|dev|prod>"
  exit 1
fi

case $ENVIRONMENT in
  local)
    ENDPOINT="http://localhost:4566"
    CAPABILITIES="" # IAM not enforced in LocalStack
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
upload_to_s3
handle_stack "$CAPABILITIES"
update_lambda_functions

echo "Deployment for $ENVIRONMENT environment is complete."
