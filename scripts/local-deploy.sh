#!/bin/bash

# This script is designed to interact with LocalStack for local AWS development.

# Set the absolute paths to the mounted volumes
S3_BUCKET="pet-shop-api-local-bucket"
STACK_NAME="PetShopApiStack-local"
TEMPLATE_FILE="/mount_volume/localstack-template.yaml"
LOCALSTACK_URL="http://localstack:4566"

# Set AWS credentials and region
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_REGION="us-east-1"


# Function to check if a service is ready
wait_for_service() {
  local service_url=$1
  echo "Waiting for $service_url to be ready..."
  until $(curl --output /dev/null --silent --head --fail $service_url); do
    printf '.'
    sleep 5
  done
}

# Function to run AWS CLI with LocalStack endpoint
run_aws() {
  aws --endpoint-url="$LOCALSTACK_URL" "$@"
}

# Wait for LocalStack S3 service to be ready
wait_for_service "$LOCALSTACK_URL/_localstack/health"

# Create a new S3 bucket if it doesn't exist
if ! run_aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
  run_aws s3 mb s3://$S3_BUCKET
fi

# Upload the zipped lambda functions to the S3 bucket
run_aws s3 cp "/mount_volume/zipped-lambdas" s3://$S3_BUCKET --recursive

# Check if the stack exists
stack_status=$(run_aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].StackStatus" --output text 2>/dev/null)

if [ "$stack_status" == "CREATE_COMPLETE" ] || [ "$stack_status" == "UPDATE_COMPLETE" ]; then
  echo "Stack $STACK_NAME already exists with status $stack_status"
elif [ -z "$stack_status" ]; then
  # Stack doesn't exist, so create it
  run_aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND
else
  echo "Stack $STACK_NAME is in status $stack_status and cannot be updated or created."
  exit 1
fi

# Wait for stack to be created
echo "Waiting for stack $STACK_NAME to be created..."
run_aws cloudformation wait stack-create-complete --stack-name $STACK_NAME

echo "Local deployment complete."
