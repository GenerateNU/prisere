# To apply changes in specific environment
# For dev
# terraform init -backend-config=backend-dev.hcl -reconfigure
# (The plan will show what changes will be made, please review the plan and make sure changes seem expected)
# terraform plan -var-file=terraform.tfvars.dev 
# terraform apply -var-file=terraform.tfvars.dev

# For prod
# terraform init -backend-config=backend-prod.hcl -reconfigure
# terraform plan -var-file=terraform.tfvars.prod
# terraform apply -var-file=terraform.tfvars.prod

# 'terraform apply' will apply to the dev env by default

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_sqs_queue" "disaster_notifications" {
  name = "${var.project_name}-queue-${var.environment}"
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.email_dlq.arn
    maxReceiveCount     = 3 # This is how many times the message will be 
    # sent to the main queue before falling back to the DLQ
  })
}

# Dead Letter Queue for failed messages
resource "aws_sqs_queue" "email_dlq" {
  name                      = "${var.project_name}-email-dlq-${var.environment}"
  message_retention_seconds = 1209600 # 14 days
  
  tags = {
    Name        = "${var.project_name}-email-dlq"
    Environment = var.environment
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-email-processor-${var.environment}"
  retention_in_days = 7
  
  tags = {
    Name        = "${var.project_name}-lambda-logs"
    Environment = var.environment
  }
}