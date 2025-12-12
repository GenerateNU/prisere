# Lambda Layer
resource "aws_lambda_layer_version" "email_processor_layer" {
  filename            = "../src/lambda/email-processor/layer.zip"
  layer_name          = "${var.project_name}-email-processor-layer-${var.environment}"
  compatible_runtimes = ["nodejs20.x"]
  compatible_architectures = ["arm64"]
  source_code_hash    = filebase64sha256("../src/lambda/email-processor/layer.zip")
}


# Lambda Function
resource "aws_lambda_function" "email_processor" {
  filename         = "../src/lambda/email-processor/function.zip"
  function_name    = "${var.project_name}-email-processor-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("../src/lambda/email-processor/function.zip")
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 128
  architectures   = ["arm64"]

  layers = [aws_lambda_layer_version.email_processor_layer.arn]

  environment {
    variables = {
      SES_FROM_EMAIL = var.ses_from_email
      SES_REGION     = var.aws_region
    }
  }

  dead_letter_config {
    target_arn = aws_sqs_queue.email_dlq.arn
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_logs,
    aws_iam_role_policy.lambda_logs,
    aws_iam_role_policy.lambda_sqs,
    aws_iam_role_policy.lambda_ses
  ]

  tags = {
    Name        = "${var.project_name}-email-processor"
    Environment = var.environment
  }
}

# SQS Trigger for Lambda
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.disaster_notifications.arn
  function_name    = aws_lambda_function.email_processor.arn
  batch_size       = 10
  maximum_batching_window_in_seconds = 0
  
  # Report batch item failures so only failed messages are retried
  function_response_types = ["ReportBatchItemFailures"]
  
  # Scaling config for cost optimization
  scaling_config {
    maximum_concurrency = 2
  }

  depends_on = [
    aws_iam_role_policy.lambda_sqs
  ]
}