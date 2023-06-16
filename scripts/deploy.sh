#!/bin/bash

set -e

STACK_NAME="PetShopApiStack"
TEMPLATE_FILE="./infrastructure/template.yaml"
API_FILE="./infrastructure/api.yaml"
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
aws s3 cp . "s3://pet-shop-api-deployment-bucket/zipped-lambdas/$ENVIRONMENT" --recursive

# Upload API definition to S3 bucket
cd "$DIR"
aws s3 cp "$API_FILE" "s3://$S3_BUCKET/api.yaml"

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

echo "Deployment for $ENVIRONMENT environment is complete."
