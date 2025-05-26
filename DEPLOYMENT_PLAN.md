# Deployment Plan: MyPrompts Application

This document outlines the plan for deploying the MyPrompts application, which consists of several microservices and a frontend.

## 1. Overview

The MyPrompts application is designed with a microservices architecture to ensure scalability, maintainability, and independent deployment of its components. The services are:
- **API Gateway:** Single entry point for all client requests, routing traffic to the appropriate backend services.
- **User Service:** Manages user authentication, registration, and user profiles.
- **Project Service:** Handles creation, management, and storage of user projects.
- **Prompt Service:** Manages prompt templates, versions, and related metadata.
- **Agent Management Service:** Manages configurations and details of AI agents used within projects.
- **AI Interaction Service:** Facilitates communication and interaction with underlying AI models or external AI services.
- **Frontend:** A React Single Page Application (SPA) served by Nginx, providing the user interface.

## 2. Prerequisites

- Docker installed on the deployment server or local machine.
- Docker Compose installed (optional, but highly recommended for local development and testing).
- Access to a MongoDB instance: This can be a local installation, a cloud-hosted service (like MongoDB Atlas), or a containerized version for development.
- A secrets management solution for production environments (e.g., HashiCorp Vault, AWS Secrets Manager, Google Cloud Secret Manager, Kubernetes Secrets).

## 3. Building Docker Images

For each service and the frontend, the Docker image can be built using the `docker build` command. Navigate to the service's directory and run:

- **api-gateway:**
  ```bash
  cd api-gateway
  docker build -t myprompts/api-gateway:latest .
  ```
- **user-service:**
  ```bash
  cd user-service
  docker build -t myprompts/user-service:latest .
  ```
- **project-service:**
  ```bash
  cd project-service
  docker build -t myprompts/project-service:latest .
  ```
- **prompt-service:**
  ```bash
  cd prompt-service
  docker build -t myprompts/prompt-service:latest .
  ```
- **agent-management-service:**
  ```bash
  cd agent-management-service
  docker build -t myprompts/agent-management-service:latest .
  ```
- **ai-interaction-service:**
  ```bash
  cd ai-interaction-service
  docker build -t myprompts/ai-interaction-service:latest .
  ```
- **frontend:**
  ```bash
  cd frontend
  docker build -t myprompts/frontend:latest .
  ```

## 4. Environment Variable Management

Each service requires specific environment variables to be set at runtime.

**`api-gateway`:**
- `PORT`: Port for the service to listen on (e.g., 80 or 8080).
- `USER_SERVICE_URL`: URL of the User Service (e.g., http://user-service:80).
- `PROJECT_SERVICE_URL`: URL of the Project Service (e.g., http://project-service:80).
- `PROMPT_SERVICE_URL`: URL of the Prompt Service (e.g., http://prompt-service:80).
- `AGENT_MANAGEMENT_SERVICE_URL`: URL of the Agent Management Service (e.g., http://agent-management-service:80).

**`user-service`:**
- `PORT`: Port for the service to listen on (e.g., 80).
- `MONGODB_URI`: MongoDB connection string (e.g., `mongodb://username:password@host:port/mydatabase`).
- `JWT_SECRET`: Secret key for signing and verifying JSON Web Tokens.

**`project-service`:**
- `PORT`: Port for the service to listen on (e.g., 80).
- `MONGODB_URI`: MongoDB connection string.

**`prompt-service`:**
- `PORT`: Port for the service to listen on (e.g., 80).
- `MONGODB_URI`: MongoDB connection string.

**`agent-management-service`:**
- `PORT`: Port for the service to listen on (e.g., 80).
- `MONGODB_URI`: MongoDB connection string.
- `API_ENCRYPTION_KEY`: Key for encrypting sensitive API credentials or configurations.

**`ai-interaction-service`:**
- `PORT`: Port for the service to listen on (e.g., 80).
- `MONGODB_URI`: MongoDB connection string (if used for caching or logging, otherwise might not be needed directly).
- `API_ENCRYPTION_KEY`: Key for encrypting/decrypting data, if applicable.
- `PROMPT_SERVICE_URL`: URL of the Prompt Service (e.g., http://prompt-service:80).

**`frontend`:**
- The Nginx container itself typically does not require runtime environment variables for serving static content. Configuration for the React application (e.g., API endpoint URLs) should be baked in during the build process (e.g., via `.env` files used by `npm run build`) or managed by deploying different builds for different environments.

**Note on Security:**
- `MONGODB_URI` should include credentials and must be treated as a highly sensitive secret. Avoid exposing it in version control.
- `JWT_SECRET` must be a cryptographically strong, random string. It is critical for security and must be kept secret.
- `API_ENCRYPTION_KEY` must be a strong cryptographic key, kept secret, and managed securely.

These variables can be supplied via `.env` files (for local Docker Compose), Kubernetes ConfigMaps/Secrets, or other environment-specific configuration methods provided by hosting platforms.

## 5. Running with Docker Compose (Local/Development)

A `docker-compose.yml` file can be used to orchestrate all services for local development and testing.

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  user-service:
    build: ./user-service
    # image: myprompts/user-service:latest # Uncomment if using pre-built images
    ports:
      - "3001:80" # Host:Container
    environment:
      - PORT=80
      - MONGODB_URI=mongodb://mongodb:27017/userdb
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      mongodb:
        condition: service_healthy

  project-service:
    build: ./project-service
    # image: myprompts/project-service:latest
    ports:
      - "3002:80"
    environment:
      - PORT=80
      - MONGODB_URI=mongodb://mongodb:27017/projectdb
    depends_on:
      mongodb:
        condition: service_healthy

  prompt-service:
    build: ./prompt-service
    # image: myprompts/prompt-service:latest
    ports:
      - "3003:80"
    environment:
      - PORT=80
      - MONGODB_URI=mongodb://mongodb:27017/promptdb
    depends_on:
      mongodb:
        condition: service_healthy

  agent-management-service:
    build: ./agent-management-service
    # image: myprompts/agent-management-service:latest
    ports:
      - "3004:80"
    environment:
      - PORT=80
      - MONGODB_URI=mongodb://mongodb:27017/agentdb
      - API_ENCRYPTION_KEY=${API_ENCRYPTION_KEY}
    depends_on:
      mongodb:
        condition: service_healthy

  ai-interaction-service:
    build: ./ai-interaction-service
    # image: myprompts/ai-interaction-service:latest
    ports:
      - "3005:80"
    environment:
      - PORT=80
      - MONGODB_URI=mongodb://mongodb:27017/interactiondb # If needed
      - API_ENCRYPTION_KEY=${API_ENCRYPTION_KEY}
      - PROMPT_SERVICE_URL=http://prompt-service:80
    depends_on:
      - mongodb # If it uses MongoDB
      - prompt-service

  api-gateway:
    build: ./api-gateway
    # image: myprompts/api-gateway:latest
    ports:
      - "8080:80" # Host 8080 maps to container port 80 (as defined by PORT env var)
    environment:
      - PORT=80
      - USER_SERVICE_URL=http://user-service:80
      - PROJECT_SERVICE_URL=http://project-service:80
      - PROMPT_SERVICE_URL=http://prompt-service:80
      - AGENT_MANAGEMENT_SERVICE_URL=http://agent-management-service:80
      # Add AI_INTERACTION_SERVICE_URL if api-gateway proxies to it
      # - AI_INTERACTION_SERVICE_URL=http://ai-interaction-service:80 
    depends_on:
      - user-service
      - project-service
      - prompt-service
      - agent-management-service
      - ai-interaction-service

  frontend:
    build: ./frontend
    # image: myprompts/frontend:latest
    ports:
      - "3000:80" # Host 3000 maps to Nginx container port 80
    depends_on:
      - api-gateway # Ensures backend is ready before frontend might try to connect

volumes:
  mongo_data:

# Create a .env file in the same directory as docker-compose.yml for secrets:
# Example .env content:
#
# MONGODB_USER=admin
# MONGODB_PASS=secretpassword
# JWT_SECRET=your_very_strong_and_long_jwt_secret_here_at_least_32_chars
# API_ENCRYPTION_KEY=your_strong_32_byte_api_encryption_key_here
#
# Note: For the MONGODB_URI in docker-compose, it directly uses mongodb://mongodb:27017/servicename.
# If your local MongoDB requires authentication, adjust the MONGODB_URI for each service accordingly,
# e.g., MONGODB_URI=mongodb://${MONGODB_USER}:${MONGODB_PASS}@mongodb:27017/userdb?authSource=admin
```

Ensure the URLs for inter-service communication in the `docker-compose.yml` use the service names (e.g., `http://user-service`) and their internal container ports (which are set to 80 in this example via the `PORT` environment variable for each service).

## 6. Production Deployment Considerations

- **Database:** Use a managed MongoDB service (e.g., MongoDB Atlas, AWS DocumentDB, Azure Cosmos DB with MongoDB API) or a robust, replicated self-hosted setup. **Do not use the Docker Compose MongoDB configuration for production.**
- **Secrets Management:** Integrate with a dedicated secrets management system (e.g., HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, Google Cloud Secret Manager, Kubernetes Secrets). Do not hardcode secrets or rely on plain `.env` files in production environments.
- **Configuration Management:** Utilize environment variables provided by the hosting platform (e.g., PaaS configurations, Kubernetes ConfigMaps).
- **Scalability:** Design backend services to be stateless for easier horizontal scaling. Use load balancers in front of multiple instances of each service.
- **Logging:** Implement centralized logging (e.g., ELK Stack - Elasticsearch, Logstash, Kibana; Splunk; or cloud provider services like AWS CloudWatch Logs, Google Cloud Logging). Structure logs for easy parsing and analysis.
- **Monitoring & Alerting:** Set up comprehensive monitoring for application performance (APM), error rates, resource utilization (CPU, memory, disk, network), and key business metrics. Tools like Prometheus, Grafana, Datadog, New Relic, or cloud provider solutions (AWS CloudWatch, Azure Monitor, Google Cloud Monitoring) can be used. Configure alerts for critical issues.
- **Networking:** Configure appropriate firewall rules, Virtual Private Clouds (VPCs), and potentially an Ingress controller if deploying to Kubernetes. Ensure secure communication between services (e.g., using mTLS if necessary).
- **Security Hardening:**
    - Regularly update base Docker images and application dependencies to patch vulnerabilities.
    - Run containers with the least privileges necessary (non-root users).
    - Utilize security scanning tools for container images (e.g., Trivy, Clair, Docker Scout).
    - Implement rate limiting and web application firewall (WAF) capabilities at the edge.
- **Backup and Recovery:** Implement and regularly test backup strategies for your MongoDB database and any other persistent storage. Define recovery time objectives (RTO) and recovery point objectives (RPO).
- **CI/CD (Continuous Integration/Continuous Deployment):** Automate the build, test, and deployment processes using a CI/CD pipeline (e.g., Jenkins, GitLab CI, GitHub Actions, AWS CodePipeline).

## 7. High-Level Deployment Strategy (Example: Kubernetes)

1.  **Package Applications:** Build Docker images for each service and the frontend. Push these images to a container registry (e.g., Docker Hub, AWS ECR, Google GCR, Azure CR).
2.  **Cluster Setup:** Provision a Kubernetes cluster (e.g., Amazon EKS, Google GKE, Azure AKS, or a self-managed cluster).
3.  **Kubernetes Manifests:** Create Kubernetes YAML manifests for each application component:
    *   `Deployment`: Defines the desired state for each application (replicas, image, etc.).
    *   `Service`: Exposes applications internally within the cluster or externally.
    *   `ConfigMap`: Manages non-sensitive configuration data.
    *   `Secret`: Manages sensitive data like API keys and database credentials.
    *   `Ingress`: Manages external access to services, typically HTTP/S routing.
    *   `PersistentVolumeClaim` (PVC): If any service requires persistent storage beyond the database.
4.  **Database:** Set up or connect to the production MongoDB instance. Store its connection URI and credentials securely in Kubernetes Secrets.
5.  **Configuration:** Store non-sensitive configurations in ConfigMaps and inject them as environment variables or files into containers. Use Kubernetes Secrets for sensitive data.
6.  **Deploy Applications:** Apply the Kubernetes manifests to the cluster using `kubectl apply -f <directory_with_manifests>`.
7.  **Expose Services:**
    *   Expose the API Gateway using a Kubernetes Service of type `LoadBalancer` or an `Ingress` resource to make it accessible from the internet.
    *   Expose the Frontend similarly, typically through an Ingress.
8.  **Monitoring & Logging:** Integrate cluster and application monitoring/logging with chosen solutions (e.g., Prometheus, Grafana, ELK stack, or cloud-native tools).
9.  **CI/CD Pipeline:** Implement a CI/CD pipeline that automates:
    *   Code checkout and compilation.
    *   Unit and integration tests.
    *   Docker image building and pushing to the registry.
    *   Updating Kubernetes deployments (e.g., using `kubectl rollout restart deployment` or GitOps tools like ArgoCD/Flux).

This is a high-level example. The specific strategy will depend on the chosen cloud provider, tools, and infrastructure requirements.
Consider aspects like blue/green deployments or canary releases for minimizing downtime and risk during updates.
