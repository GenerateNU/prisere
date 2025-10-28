# Prerequisites:
# The 'prisere-bucket' must be create originally (one time manual setup)


terraform {
  backend "s3" {
    bucket         = "prisere-bucket"
    # key            = NOTE: do not specify the key, as we will have two state files, one for dev and prod each.
    region         = "us-east-1"
    encrypt        = true
    use_lockfile = true  # We are able to lock the state directly in S3, so that state is not edited by two 
    # people at the same time
  }

}

# resource "aws_s3_bucket_versioning" "terraform_state" {
#     bucket = backend.bucket.id
    
#     versioning_configuration {
#         status = "Enabled"
#     }
# }

# resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
#     bucket = backend.bucket.id

#     rule {
#         apply_server_side_encryption_by_default {
#         sse_algorithm = "AES256"
#         }
#     }
# }