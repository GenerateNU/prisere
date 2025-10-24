variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "ses_from_email" {
  description = "Verified SES email address to send from"
  type        = string
  default     = "priseregenerate@gmail.com"
}

variable "sqs_queue_url" {
  description = "URL of the existing SQS queue"
  type        = string
  default = "https://sqs.us-east-1.amazonaws.com/478867930449/Prisere-jobs"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "prisere-disaster-notifications"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}