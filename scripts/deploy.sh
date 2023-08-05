#!/bin/bash

set -e

STACK_NAME="PetShopApiStack"
TEMPLATE_FILE="./infrastructure/template.yaml"
S3_BUCKET="pet-shop-api-deployment-bucket"
ENVIRONMENT=$1  # Set environment from script argument
DIR="$(pwd)"

if [[ -z "$ENVIRONMENT" ]]; then
    echo "Environment argument is missing. Usage: ./deploy.sh <env>"
    exit 1
fi

echo "Starting deployment for $ENVIRONMENT environment..."

# Create S3 bucket
aws s3 mb "s3://$S3_BUCKET" || true  # Bucket creation may fail if it already exists, but we can continue

# Zip and upload Lambda functions to S3 bucket
cd "$DIR/zipped-lambdas" || exit
aws s3 cp . "s3://$S3_BUCKET/zipped-lambdas/$ENVIRONMENT" --recursive --exclude "*" --include "*.zip"

# Upload API yaml files to S3 bucket
cd "$DIR"
aws s3 cp ./infrastructure/ s3://$S3_BUCKET/ --recursive --exclude "*" --include "*.yaml"

# Check if stack exists
STACK_EXISTS=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" || true)

if [[ -z "$STACK_EXISTS" ]]; then
    # If stack does not exist, create one
    echo "Creating CloudFormation stack..."
    aws cloudformation create-stack --stack-name "$STACK_NAME" --template-body file://"$TEMPLATE_FILE" --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
else
    # If stack exists, update the existing stack
    echo "Updating CloudFormation stack..."
    aws cloudformation update-stack --stack-name "$STACK_NAME" --template-body file://"$TEMPLATE_FILE" --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
fi

# Function to update Lambda functions to the latest version
update_lambda_functions() {
  latest_version=$1

  # Get the .zip filenames in the zipped-lambdas directory
  endpoints=($(ls "$DIR/zipped-lambdas" | grep '.zip'))

  for endpoint in "${endpoints[@]}"; do
    endpoint_name="${endpoint%.zip}"
    function_name="pet-shop-api-$endpoint_name-$ENVIRONMENT"

    aws lambda update-function-code \
      --function-name "$function_name" \
      --s3-bucket "$S3_BUCKET" \
      --s3-key "zipped-lambdas/$ENVIRONMENT/$endpoint"

    echo "Updated Lambda function $function_name to version $latest_version"
  done
}

# Function to create and/or update Lambda aliases to the latest version
update_lambda_aliases() {
  # Get the .zip filenames in the zipped-lambdas directory
  endpoints=($(ls "$DIR/zipped-lambdas" | grep '.zip'))

  for endpoint in "${endpoints[@]}"; do
    endpoint_name="${endpoint%.zip}"
    function_name="pet-shop-api-$endpoint_name-$ENVIRONMENT"

    # Check if the alias exists
    alias_exists=$(aws lambda get-alias --function-name "$function_name" --name "latest" || true)

    if [[ -z "$alias_exists" ]]; then
      # If alias does not exist, create one
      aws lambda create-alias \
        --function-name "$function_name" \
        --name "latest" \
        --function-version "\$LATEST"  # Use $LATEST to always point to the latest version

      echo "Alias latest for function $function_name created successfully"
    else
      # If alias exists, update the existing alias
      aws lambda update-alias \
        --function-name "$function_name" \
        --name "latest" \
        --function-version "\$LATEST"  # Use $LATEST to always point to the latest version

      echo "Alias latest for function $function_name updated successfully"
    fi
  done
}

# Function to update the version tracker file
update_version_tracker() {
  latest_version=$1
  echo "$latest_version" > version_tracker.txt
}

# Function to get the latest version number from the version tracker file
get_latest_version_from_version_tracker() {
  version_tracker_file="version_tracker.txt"
  if [ -f "$version_tracker_file" ]; then
    cat "$version_tracker_file"
  else
    echo "0"  # Initial version if the version_tracker file doesn't exist
  fi
}

# Check if there are new zip files in S3
LATEST_VERSION=$(get_latest_version_from_version_tracker)
if [ "$LATEST_VERSION" != "$PREVIOUS_VERSION" ]; then
  echo "New zip files found in S3. Updating Lambda functions..."
  update_lambda_functions "$LATEST_VERSION"
  update_lambda_aliases
  update_version_tracker "$LATEST_VERSION"
fi

echo "Deployment for $ENVIRONMENT environment is complete."
