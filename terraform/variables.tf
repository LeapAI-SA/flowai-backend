variable "docker_image_name" {
  description = "Name of the Docker image"
  type        = string
}

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region_name" {
  description = "Region for the Cloud Run service"
  type        = string
}

variable "max_instances" {
  description = "Max instances for the Cloud Run service"
  type        = number
}

variable "dynamic_env_vars" {
  description = "Dynamic environment variables"
  type        = map(string)
  default     = {}
}

variable "dynamic_env_secrets" {
  description = "Dynamic environment secrets"
  type        = map(string)
  default     = {}
}
