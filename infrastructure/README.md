# Infrastructure Setup for PetShop API

This document provides instructions on setting up the AWS infrastructure for the PetShop API using AWS CloudFormation.

# AWS CLI and AWS Configuration
Ensure AWS CLI is installed and configured. You can check with the following commands:
```
aws --version
aws configure
```

In the AWS configuration, you will need to provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region name
- Default output format (usually `json`)

# S3 Bucket Creation
We will create an S3 bucket to store our Lambda function .zip files:
```
aws cloudformation create-stack --stack-name pet-shop-api-deployment-bucket --template-body file://infrastructure/s3.yaml
```

# Upload Files to S3
Now we will upload our Lambda function .zip files and YAML templates to the S3 bucket:

Note: to create the zip files, run `npm run bundle`

```
aws s3 cp ./zipped-lambdas s3://pet-shop-api-deployment-bucket/zipped-lambdas/dev --recursive
aws s3 cp ./zipped-lambdas s3://pet-shop-api-deployment-bucket/zipped-lambdas/prod --recursive
aws s3 cp ./infrastructure/api.yaml s3://pet-shop-api-deployment-bucket/api.yaml
```

# Deploy PetShopApiStack
Now, you can use AWS CloudFormation to deploy your API Gateway and Lambda functions. You'll need to replace `<YourStackName>` with a name for your CloudFormation stack, and `<YourBucketName>` with the name of your S3 bucket:
```
// dev:
aws cloudformation create-stack --stack-name PetShopApiStack --template-body file://infrastructure/template.yaml --parameters ParameterKey=Environment,ParameterValue=dev --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND

// prod:
aws cloudformation create-stack --stack-name PetShopApiStack --template-body file://infrastructure/template.yaml --parameters ParameterKey=Environment,ParameterValue=prod --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
```

# Check Stack Status
You can use the following command to check the status of your CloudFormation stack:
```
aws cloudformation describe-stacks --stack-name PetShopApiStack
```

The output will include a `StackStatus` field that tells you the current status of the stack.

# Update Stack
If you make changes to your templates and need to update your stack, you can use the following command:
```
aws s3 cp ./zipped-lambdas s3://pet-shop-api-deployment-bucket/zipped-lambdas/dev --recursive
aws s3 cp ./zipped-lambdas s3://pet-shop-api-deployment-bucket/zipped-lambdas/prod --recursive
aws s3 cp ./infrastructure/api.yaml s3://pet-shop-api-deployment-bucket/api.yaml

// dev:
aws cloudformation update-stack --stack-name PetShopApiStack --template-body file://infrastructure/template.yaml --parameters ParameterKey=Environment,ParameterValue=dev --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND

// prod:
aws cloudformation update-stack --stack-name PetShopApiStack --template-body file://infrastructure/template.yaml --parameters ParameterKey=Environment,ParameterValue=prod --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
```

# Delete Stack
When you're done with your stack, you can delete it with the following command:
```
aws cloudformation delete-stack --stack-name PetShopApiStack
```
