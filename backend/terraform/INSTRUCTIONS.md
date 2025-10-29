### Deploy AWS resources with Terraform
To apply changes in specific environment

# Set variables from .env

(Change out with dev vars when needed)
run:

export TF_VAR_ses_from_email=$(grep SES_FROM_EMAIL ../.env | cut -d '=' -f2 | tr -d '"')
export TF_VAR_sqs_queue_url=$(grep SQS_QUEUE_URL_PROD ../.env | cut -d '=' -f2 | tr -d '"')
terraform apply

# For dev

terraform init -backend-config=backend-dev.hcl -reconfigure
(The plan will show what changes will be made, please review the plan and make sure changes seem expected)
terraform plan -var-file=terraform.tfvars.dev 
terraform apply -var-file=terraform.tfvars.dev

# For prod

terraform init -backend-config=backend-prod.hcl -reconfigure
terraform plan -var-file=terraform.tfvars.prod
terraform apply -var-file=terraform.tfvars.prod

'terraform apply' will apply to the dev env by default

### Authenticating to AWS
# Locally
You will need to set the access key ID and secret vars in your .env file:
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

- Deploy resources with Terraform, and the AWS access credentials needed will output to the console. 
- We have a user 'app_service_user' that is created and should be used for local testing. 
- To access its secret key run 'terraform output app_secret_access_key'

To get all credentials run:

`echo "AWS_ACCESS_KEY_ID=$(terraform output -raw app_access_key_id)" >> .env
echo "AWS_SECRET_ACCESS_KEY=$(terraform output -raw app_secret_access_key)" >> .env
echo "AWS_REGION=us-east-1" >> .env`

# Production
- IAM Roles are assumed by AWS resources and used in prod. No access keys needed for this.
