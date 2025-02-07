# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Feature Flags Backend

This is the backend service for managing feature flags. It uses Express.js for the server, MongoDB for storing feature flags, and Redis for caching.

## Prerequisites

- Node.js
- MongoDB
- Redis

## Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd Backend
   ```

## Environment Variables

Set the following environment variables:

```sh
MONGO_URI=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
```
