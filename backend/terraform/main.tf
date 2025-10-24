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

# Get the existing SQS queue
# DOUBLE CHECK THIS
data "aws_sqs_queue" "disaster_notifications" {
  name = split("/", var.sqs_queue_url)[length(split("/", var.sqs_queue_url)) - 1]
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