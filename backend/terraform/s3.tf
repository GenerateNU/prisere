# NOTE: If you have errors with the bucket already exists please run:
# terraform import aws_s3_bucket.prisere_storage prisere-objects-storage
# This bucket should never be destroyed and has a lifecyle preventing that. 
# Do not remove the lifecylcle prevent_destroy = true configuration or our S3 bucket will be destroyed.
resource "aws_s3_bucket" "prisere_storage" {
  bucket = "prisere-objects-storage" # Have one bucket only, not one per environment
  
  tags = {
    Name        = "Application Storage"
    Environment = "production"
  }
  #   Prevent the bucket from being deleted
  lifecycle {
    prevent_destroy = true
  }
}

# Enable versioning to keep all file versions
resource "aws_s3_bucket_versioning" "app_storage_versioning" {
  bucket = aws_s3_bucket.prisere_storage.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# Lifecycle configuration allows us to move certain (unused) objects to a lower cost storage tier in order to reduce S3 costs
resource "aws_s3_bucket_lifecycle_configuration" "app_storage_lifecycle" {
  bucket = aws_s3_bucket.prisere_storage.id

  # PDFs lifecycle
  rule {
    id     = "move-pdfs-to-infrequent-access"
    status = "Enabled"

    filter {
      prefix = "pdfs/"
    }

    # Current versions
    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 180
      storage_class = "GLACIER_IR"
    }

    # Non-current versions (old versions)
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "GLACIER_IR"
    }

    # Delete very old non-current versions after 365 days
    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }

  # Images lifecycle
  rule {
    id     = "move-images-to-infrequent-access"
    status = "Enabled"

    filter {
      prefix = "images/"
    }

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    # Keep only last 1 version of profile pictures
    noncurrent_version_expiration {
      newer_noncurrent_versions = 1
      noncurrent_days          = 1
    }
  }
}

# Output the important values
output "app_storage_bucket_name" {
  value       = aws_s3_bucket.prisere_storage.bucket
  description = "S3 bucket name for application storage"
}

output "app_storage_bucket_arn" {
  value       = aws_s3_bucket.prisere_storage.arn
  description = "S3 bucket ARN"
}

