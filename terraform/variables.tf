variable "namespace" {
  description = "Kubernetes namespace for the Learning-Blog release"
  type        = string
  default     = "learning-blog"
}

variable "release_name" {
  description = "Name of the Helm release"
  type        = string
  default     = "learning-blog"
}

variable "db_password" {
  description = "Database password injected into secrets.dbPassword"
  type        = string
  sensitive   = true
}

variable "backend_image_tag" {
  description = "Docker image tag for tejalb29/learning-backend-blog"
  type        = string
  default     = "v1.1"
}

variable "frontend_image_tag" {
  description = "Docker image tag for tejalb29/learning-frontend-blog"
  type        = string
  default     = "v1.0"
}