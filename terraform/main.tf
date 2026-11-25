resource "helm_release" "postgresql" {
  name             = "${var.release_name}-db"
  repository       = "https://charts.bitnami.com/bitnami"
  chart            = "postgresql"
  namespace        = var.namespace
  create_namespace = true
  wait             = true
  timeout          = 300

  values = [
    file("${path.module}/../postgres-values.yaml")
  ]

  set_sensitive = [
    {
      name  = "auth.password"
      value = var.db_password
    }
  ]
}

resource "helm_release" "learning_blog" {
  name             = var.release_name
  chart            = "${path.module}/../learning-blog"
  namespace        = var.namespace
  create_namespace = true
  wait             = true
  timeout          = 300

  values = [
    file("${path.module}/../learning-blog/values.yaml")
  ]

  set = [
    {
      name  = "backend.image.tag"
      value = var.backend_image_tag
    },
    {
      name  = "frontend.image.tag"
      value = var.frontend_image_tag
    }
  ]

  set_sensitive = [
    {
      name  = "secrets.dbPassword"
      value = var.db_password
    }
  ]
}