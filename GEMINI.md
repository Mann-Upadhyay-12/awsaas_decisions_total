# Project Instructions: AWSaaS

Adaptive Web Speed as a Service (AWSaaS).

## Project Overview
This project aims to provide highly optimized web content delivery, focusing on speed and adaptive resource loading.

## TODOs
- [ ] **Image Processing Automation:** Implement a build-time script (e.g., using `ffmpeg` or `sharp`) to automatically generate multiple resolutions (small, medium, large) for high-quality source images.
- [ ] **Frontend Integration:** Complete the frontend integration for various services and features.
- [ ] **Backend Integration:** Implement saving form data to PostgreSQL.
- [ ] **Adaptive Loading:** Refine the `useAWSaaS` hook and `DeferredFeature` component to better handle varying network conditions.

## Tech Stack
- **Frontend:** React (TypeScript), Vite, Vanilla CSS.
- **Backend:** Go (Gin), PostgreSQL, Redis.
- **Infrastructure:** Nginx, Prometheus, Grafana, Docker.

## Conventions
- Use surgical updates for code changes.
- Adhere to the Research -> Strategy -> Execution lifecycle.
- Maintain visual polish and interactive feedback in the UI.
