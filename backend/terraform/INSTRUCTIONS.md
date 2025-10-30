### Deploy AWS resources with Terraform
To apply changes in specific environment

### Authenticating to AWS
Note: before any of this, you will need to create an AWS access key (under the Prisere IAM user). Make sure you have the AWS CLI installed and run ```aws configure``` to set your aws access key ID and aws secret access key.

# Locally
You will need to set the access key ID and secret vars in your .env file:
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

- Deploy resources with Terraform (see Deploying resources with terraform section), and the AWS access credentials needed will output to the console. 
- We have a AWS IAM user 'app_service_user' that is created and should be used for local testing. 
- To access its secret key run 'terraform output app_secret_access_key' after you finish deploying terraform resources

To get all credentials (after running commands in 'Deploying resources with terraform section' section below) run:

```bash
echo "AWS_ACCESS_KEY_ID=$(terraform output -raw app_access_key_id)" >> .env
echo "AWS_SECRET_ACCESS_KEY=$(terraform output -raw app_secret_access_key)" >> .env
echo "AWS_REGION=us-east-1" >> .env
```

Note on production authentication:
- IAM Roles are assumed by AWS resources and used in prod. No access keys needed for this.

### Deploying resources with terraform
# Set variables from .env

First, add this to your .env:
```
SES_FROM_EMAIL=*prisere email*
SQS_QUEUE_URL_PROD=*sqs queue URL from aws account*
```
(Change out with dev vars when needed)
Once your .env is updated, run:

```bash
export TF_VAR_ses_from_email=$(grep SES_FROM_EMAIL ../.env | cut -d '=' -f2 | tr -d '"')
export TF_VAR_sqs_queue_url=$(grep SQS_QUEUE_URL_PROD ../.env | cut -d '=' -f2 | tr -d '"')
```
## Deploying the resources
- Only necesarry to do when the resources:
1) Dont exist in AWS (need to be created)
2) You need to update any AWS resources (It does not matter what you need to change/update)
3) You need to get the local AWS credentials for testing (can deploy the dev or prod resources then (do dev if in testing stage), the IAM user will be the same for both)

# To build dev AWS resources

```bash
terraform init -backend-config=backend-dev.hcl -reconfigure
```
(The plan will show what changes will be made, please review the plan and make sure changes seem expected)
```bash
terraform plan -var-file=terraform.tfvars.dev 
terraform apply -var-file=terraform.tfvars.dev
```

# To build prod AWS resources

```bash
terraform init -backend-config=backend-prod.hcl -reconfigure
terraform plan -var-file=terraform.tfvars.prod
terraform apply -var-file=terraform.tfvars.prod
```

'terraform apply' will apply to the dev env by default

- Note: See section above on how to get AWS local credentials after running the terraform commands
