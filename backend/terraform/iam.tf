# IAM Role for Lambda
# The lambda will automatically assume this IAM role, AWS automatically injects
# temporary credentials into the Lambda execution environment
# AWS SDK can then automatically find and use these credentials
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-lambda-role"
    Environment = var.environment
  }
}

# Policy for CloudWatch Logs
resource "aws_iam_role_policy" "lambda_logs" {
  name = "lambda-logs-policy"
  # We can assign the role which will be able to use this policy, that way we don't
  # have to use .env credentials or access ID/keys in production
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.lambda_logs.arn}:*"
      }
    ]
  })
}

# Policy for SQS
resource "aws_iam_role_policy" "lambda_sqs" {
  name = "lambda-sqs-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.disaster_notifications.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage"
        ]
        Resource = aws_sqs_queue.email_dlq.arn
      }
    ]
  })
}

# Policy for SES
resource "aws_iam_role_policy" "lambda_ses" {
  name = "lambda-ses-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "ses:FromAddress" = var.ses_from_email
          }
        }
      }
    ]
  })
}

# IAM Policy for S3 Access - using IAM role and policy will be more secure and easier
# to manage for more users than access keys
resource "aws_iam_policy" "app_s3_access" {
  name        = "AppS3AccessPolicy"
  description = "Policy for application to access S3 bucket for PDFs and images"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3BucketListAccess"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:ListBucketVersions"
        ]
        Resource = aws_s3_bucket.prisere_storage.arn
      },
      {
        Sid    = "S3ObjectAccess"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:GetObjectVersion",
          "s3:GetObjectMetadata",
          "s3:HeadObject"
        ]
        Resource = ["${aws_s3_bucket.prisere_storage.arn}/*",
                    "arn:aws:s3:::prisere-bucket/*"]
      }
    ]
  })

  tags = {
    Name        = "App S3 Access Policy"
    Environment = "production"
  }
}

# Create IAM User for Application
resource "aws_iam_user" "app_service_user" {
  name = "app-s3-service-user"
  path = "/service-accounts/"

  tags = {
    Name        = "Application S3 Service User"
    Environment = "production"
    Purpose     = "Programmatic access to S3 for application"
  }
}

# Policy for SES Access (reusable)
resource "aws_iam_policy" "app_ses_access" {
  name        = "AppSESAccessPolicy"
  description = "Policy for application to send emails via SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "ses:FromAddress" = var.ses_from_email
          }
        }
      }
    ]
  })
}

# Policy for SQS Access (reusable)
resource "aws_iam_policy" "app_sqs_access" {
  name        = "AppSQSAccessPolicy"
  description = "Policy for application to access SQS queues"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = [
          aws_sqs_queue.disaster_notifications.arn,
          aws_sqs_queue.email_dlq.arn
        ]
      }
    ]
  })
}

# Attach SES policy to IAM user (for local dev)
resource "aws_iam_user_policy_attachment" "app_user_ses_access" {
  user       = aws_iam_user.app_service_user.name
  policy_arn = aws_iam_policy.app_ses_access.arn
}

# Attach SQS policy to IAM user (for local dev)
resource "aws_iam_user_policy_attachment" "app_user_sqs_access" {
  user       = aws_iam_user.app_service_user.name
  policy_arn = aws_iam_policy.app_sqs_access.arn
}

# Attach SES policy to Lambda role (for production)
# Need to attach here so lambda has permissions related to SES actions (send email)
resource "aws_iam_role_policy_attachment" "lambda_ses_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.app_ses_access.arn
}

# Attach SQS policy to Lambda role (for production)
# Need to attach here so lambda has permissions related to SQS actions (receive messages)
resource "aws_iam_role_policy_attachment" "lambda_sqs_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.app_sqs_access.arn
}

# Attach S3 policy to Lambda role (for production)
# Our Lambda does not need S3 access/to assume the S3 role for now
# It might need that in the future if we use the lmabda to handle S3 operations.
# resource "aws_iam_role_policy_attachment" "lambda_s3_access" {
#   role       = aws_iam_role.lambda_role.name
#   policy_arn = aws_iam_policy.app_s3_access.arn
# }

# Attach S3 policy to IAM user (for local dev)
resource "aws_iam_user_policy_attachment" "app_user_s3_access" {
  user       = aws_iam_user.app_service_user.name
  policy_arn = aws_iam_policy.app_s3_access.arn
}

# Create access key for IAM user
resource "aws_iam_access_key" "app_user_key" {
  user = aws_iam_user.app_service_user.name
}

# Output the values needed to add to .env to authenticate locally

output "app_iam_user_name" {
  value       = aws_iam_user.app_service_user.name
  description = "IAM user name for application"
}

output "app_access_key_id" {
  value       = aws_iam_access_key.app_user_key.id
  description = "Access Key ID - save this in your .env file"
  sensitive   = false
}

output "app_secret_access_key" {
  value       = aws_iam_access_key.app_user_key.secret
  description = "Secret Access Key - save this in your .env file (shown only once!)"
    #   To see this value run:
    # terraform output app_secret_access_key
  sensitive   = true
}