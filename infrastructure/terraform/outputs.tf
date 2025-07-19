output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.taskflow.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_eks_cluster.taskflow.vpc_config[0].cluster_security_group_id
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.taskflow.name
}

output "cluster_arn" {
  description = "EKS cluster ARN"
  value       = aws_eks_cluster.taskflow.arn
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    for repo in aws_ecr_repository.repositories : repo.name => repo.repository_url
  }
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.taskflow.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}