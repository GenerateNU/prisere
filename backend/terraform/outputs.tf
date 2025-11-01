output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.email_processor.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.email_processor.arn
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

output "dlq_url" {
  description = "Dead Letter Queue URL"
  value       = aws_sqs_queue.email_dlq.url
}

output "dlq_arn" {
  description = "Dead Letter Queue ARN"
  value       = aws_sqs_queue.email_dlq.arn
}