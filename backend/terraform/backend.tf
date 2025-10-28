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
