provider "aws" {
  region = "us-east-1"
}

variable "project_name" {
  default = "udo-engine"
}

# 1. S3 Bucket for Input/Output Data
resource "aws_s3_bucket" "data_bucket" {
  bucket = "${var.project_name}-data-${random_id.suffix.hex}"
  force_destroy = true
}

resource "random_id" "suffix" {
  byte_length = 4
}

# 2. ECR Repository for the Docker Image
resource "aws_ecr_repository" "repo" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

# 3. IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Allow Lambda to log and access S3
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "s3_access" {
  name = "s3_access"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["s3:GetObject", "s3:PutObject", "s3:ListBucket"]
      Resource = [
        aws_s3_bucket.data_bucket.arn,
        "${aws_s3_bucket.data_bucket.arn}/*"
      ]
    }]
  })
}

# 4. Lambda Function (Placeholder)
# Note: You must build and push the Docker image to ECR *before* creating this resource.
# This resource is commented out to allow 'terraform apply' to create the ECR first.
/*
resource "aws_lambda_function" "udo_function" {
  function_name = var.project_name
  role          = aws_iam_role.lambda_role.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.repo.repository_url}:latest"
  timeout       = 300 # 5 minutes
  memory_size   = 2048 # 2GB RAM

  environment {
    variables = {
      RUST_BACKTRACE = "1"
    }
  }
}
*/

output "ecr_repository_url" {
  value = aws_ecr_repository.repo.repository_url
}

output "s3_bucket_name" {
  value = aws_s3_bucket.data_bucket.bucket
}
