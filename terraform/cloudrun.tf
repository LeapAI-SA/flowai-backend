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

resource "google_cloud_run_service" "default" {
  name     = var.docker_image_name
  location = var.region_name

  template {
    spec {
      containers {
        image = "${var.region_name}-docker.pkg.dev/${var.project_id}/${var.docker_image_name}/${var.docker_image_name}"

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

resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.default.name
  location = google_cloud_run_service.default.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_artifact_registry_repository" "repo" {
  location = var.region_name
  repository_id = var.docker_image_name
  format = "DOCKER"
}