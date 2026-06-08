# AWSaaS: Adaptive Web Speed as a Service

AWSaaS is an intelligent runtime decision layer that dynamically adapts content delivery based on real-time device and network profiling.

## Architecture

- **Backend (`/backend`)**: High-performance Go service that classifies users and selects delivery strategies.
- **Frontend (`/frontend`)**: React dashboard demonstrating real-time adaptation and performance metrics.
- **Infrastructure (`/infra`)**: Nginx, Prometheus, and Grafana configurations for orchestration and observability.

## Key Features

- **Runtime Profiling**: Measures RTT, CPU performance, and memory availability on the fly.
- **Heuristic Engine**: Low-latency classification (<10ms) using Go.
- **Adaptive Delivery**: Dynamic asset selection and feature deferral based on user constraints.
  - *Note*: Asset variants (Small/Medium/Large) currently require manual generation. The engine provides the strategy recommendation, while the infrastructure (Nginx) handles the routing.
- **Observability**: Real-time metrics tracking via Prometheus and Grafana.

## Quick Start

### Local Development

1. **Backend**:
   ```bash
   cd backend && go run main.go
   ```

2. **Frontend**:
   ```bash
   cd frontend && npm install && npm run dev
   ```

### Docker Orchestration

Deploy the entire stack (Postgres, Redis, Backend, Frontend, Prometheus, Grafana):

```bash
docker-compose up --build
```

Access the dashboard at `http://localhost:80`.

## Directory Structure

```text
├── backend/       # Go decision engine
├── frontend/      # React application
├── infra/         # Docker, Nginx, and Monitoring configs
└── docker-compose.yml
```
