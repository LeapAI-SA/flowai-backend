provider "google" {
  credentials = "../gcp-sa-key.json"
  project     = var.project_id
  region      = var.region_name
}

terraform {
  backend "gcs" {
    credentials = "../gcp-sa-key.json"
  }
}

# Backend Service
resource "google_cloud_run_service" "backend" {
  name     = var.backend_docker_image_name
  location = var.region_name

  template {
    spec {
      containers {
        image = "${var.region_name}-docker.pkg.dev/${var.project_id}/${var.backend_docker_image_name}/${var.backend_docker_image_name}"

        resources {
          limits = {
            memory = "2Gi"
          }
        }
        
        dynamic "env" {
          for_each = var.dynamic_env_vars
          content {
            name  = env.key
            value = env.value
          }
        }

        dynamic "env" {
          for_each = var.dynamic_env_secrets
          content {
            name  = env.key
            value = env.value
          }
        }
      }

      container_concurrency = var.max_instances
    }

    metadata {
      annotations = {
          "autoscaling.knative.dev/maxScale"      = "5"
          # "autoscaling.knative.dev/minScale"      = "1" # uncomment this line to disable cold starts
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

# Frontend Service
resource "google_cloud_run_service" "frontend" {
  name     = var.frontend_docker_image_name
  location = var.region_name

  template {
    spec {
      containers {
        image = "${var.region_name}-docker.pkg.dev/${var.project_id}/${var.frontend_docker_image_name}/${var.frontend_docker_image_name}"

        resources {
          limits = {
            memory = "2Gi"
          }
        }
        
        dynamic "env" {
          for_each = var.dynamic_env_vars
          content {
            name  = env.key
            value = env.value
          }
        }

        dynamic "env" {
          for_each = var.dynamic_env_secrets
          content {
            name  = env.key
            value = env.value
          }
        }
      }

      container_concurrency = var.max_instances
    }

    metadata {
      annotations = {
          "autoscaling.knative.dev/maxScale"      = "5"
          # "autoscaling.knative.dev/minScale"      = "1" # uncomment this line to disable cold starts
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

# IAM for Backend
resource "google_cloud_run_service_iam_member" "backend_public" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# IAM for Frontend
resource "google_cloud_run_service_iam_member" "frontend_public" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Artifact Registry for Backend
resource "google_artifact_registry_repository" "backend_repo" {
  location = var.region_name
  repository_id = var.backend_docker_image_name
  format = "DOCKER"
}

# Artifact Registry for Frontend
resource "google_artifact_registry_repository" "frontend_repo" {
  location = var.region_name
  repository_id = var.frontend_docker_image_name
  format = "DOCKER"
}