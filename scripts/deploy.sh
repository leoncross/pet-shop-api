#!/bin/bash

# Set trap for script interruptions and color variables for terminal output
trap "echo -e '\033[0;31mScript interrupted\033[0m'; exit" INT
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Global Variables
DIR="$(pwd)"
ENVIRONMENT=$1
STACK_NAME="PetShopApiStack-$ENVIRONMENT"
TEMPLATE_FILE="./infrastructure/template.yaml"
S3_BUCKET="pet-shop-api-deployment-bucket"
LAMBDA_OUTPUT_DIR="zipped-lambdas"

# Helper function to print messages with color
function print_message() {
    local TYPE=$1
    local MESSAGE=$2
    local COLOR="$YELLOW" # Default to yellow for info

    # Set color based on message type
    if [ "$TYPE" == "ERROR" ]; then
        COLOR="$RED"
    elif [ "$TYPE" == "SUCCESS" ]; then
        COLOR="$GREEN"
    fi

    echo -e "${COLOR}${TYPE}:${NC} ${MESSAGE}"
}

# AWS CLI command wrapper
function aws_cli() {
    aws "$@"
}

# Ensure S3 bucket exists or create it if not
function ensure_s3_bucket() {
    print_message "INFO" "Checking if S3 bucket exists..."
    if ! aws_cli s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
        print_message "INFO" "Creating S3 bucket..."
        if aws_cli s3 mb "s3://$S3_BUCKET"; then
            print_message "SUCCESS" "S3 bucket created successfully."
        else
            print_message "ERROR" "Failed to create bucket."
            exit 1
        fi
    else
        print_message "SUCCESS" "S3 bucket already exists."
    fi
}

# Upload files to S3
function upload_to_s3() {
    print_message "INFO" "Uploading Lambda zip files to S3..."
    if aws_cli s3 cp "$DIR/$LAMBDA_OUTPUT_DIR" "s3://$S3_BUCKET/$LAMBDA_OUTPUT_DIR/$ENVIRONMENT" --recursive --exclude "*" --include "*.zip"; then
        print_message "SUCCESS" "Lambda zip files uploaded successfully."
    else
        print_message "ERROR" "Failed to upload zipped lambdas."
        exit 1
    fi
    print_message "INFO" "Uploading infrastructure templates to S3..."
    if aws_cli s3 cp ./infrastructure/ s3://$S3_BUCKET/ --recursive --exclude "*" --include "*.yaml"; then
        print_message "SUCCESS" "Infrastructure templates uploaded successfully."
    else
        print_message "ERROR" "Failed to upload infrastructure files."
        exit 1
    fi
}

# Handle CloudFormation stack creation or update
function manage_stack() {
    print_message "INFO" "Checking CloudFormation Stack status..."
    if aws_cli cloudformation describe-stacks --stack-name "$STACK_NAME" &>/dev/null; then
        print_message "INFO" "Updating existing CloudFormation Stack..."
        if ! aws_cli cloudformation update-stack --stack-name "$STACK_NAME" --template-body file://"$TEMPLATE_FILE" --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT"; then
            print_message "ERROR" "Failed to update stack."
            exit 1
        fi
        aws_cli cloudformation wait stack-update-complete --stack-name "$STACK_NAME"
        print_message "SUCCESS" "Stack updated successfully."
    else
        print_message "INFO" "Creating new CloudFormation Stack..."
        if ! aws_cli cloudformation create-stack --stack-name "$STACK_NAME" --template-body file://"$TEMPLATE_FILE" --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT"; then
            print_message "ERROR" "Failed to create stack."
            exit 1
        fi
        aws_cli cloudformation wait stack-create-complete --stack-name "$STACK_NAME"
        print_message "SUCCESS" "Stack created successfully."
    fi
}

# Main deployment function
function deploy() {
    print_message "INFO" "Deployment Script Started"
    if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
        print_message "ERROR" "Invalid environment specified. Allowed values are 'dev' or 'prod'."
        exit 1
    fi
    print_message "INFO" "Deploying to $ENVIRONMENT environment"

    ensure_s3_bucket
    upload_to_s3
    manage_stack
    print_message "SUCCESS" "Deployment for $ENVIRONMENT environment is complete."
}

# Start the script
deploy
