# Smartmove WorkOS

Welcome to the central repository for the Smartmove WorkOS project. This document provides all the necessary information for developers to get started, understand the architecture, and contribute effectively.

## Table of Contents 

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
- [Deployment](#deployment)
  - [Deploying to Vercel](#deploying-to-vercel)
- [Architecture](#architecture)
  - [Multi-Repository Structure](#multi-repository-structure)
  - [Authentication Flow](#authentication-flow)
  - [Data Layer](#data-layer)
- [Technical Documentation](#technical-documentation)
  - [API Endpoints](#api-endpoints)
  - [UI Components](#ui-components)
  - [Custom Hooks](#custom-hooks)
  - [Available Data Sources](#available-data-sources)
- [Development Guidelines](#development-guidelines)
  - [Component Development](#component-development)
  - [API Development](#api-development)
  - [Testing](#testing)

---

## Getting Started

Follow these instructions to set up your local development environment.

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   [pnpm](https://pnpm.io/) package manager
-   Git

### Local Development Setup

This project uses a multi-repo structure powered by Git submodules. To set up the environment correctly, you **must** use the provided helper script.

**DO NOT use `git submodule update --init` directly.**

1.  **Clone the main repository:**
    ```bash
    git clone https://github.com/quangsmg/sm-workos.git
    cd sm-workos
    ```

2.  **Run the environment setup script:**
    This script intelligently clones all submodules you have access to. If you lack permissions for a specific module (e.g., `reports`), it creates a functional placeholder, allowing the project to build without errors.
    ```bash
    ./init-dev-env.sh
    ```

3.  **Install dependencies:**
    ```bash
    pnpm install
    ```

4.  **Start the development server:**
    ```bash
    pnpm run dev
    ```
    The application will be available at `http://localhost:3000`.

---

## Deployment

### Deploying to Vercel

Deploying to Vercel requires specific configuration to handle private Git submodules.

1.  **Create a GitHub Personal Access Token (PAT):**
    -   Navigate to GitHub's [Fine-grained tokens](https://github.com/settings/tokens?type=beta) page.
    -   Generate a new token with **Read-only** access to the **Contents** of the main repository and all submodule repositories.

2.  **Configure Vercel Environment Variables:**
    -   In your Vercel project, go to **Settings > Environment Variables**.
    -   Create a variable named `GITHUB_PAT` and paste your token as the value.

3.  **Grant Vercel App Access:**
    -   In your GitHub account **Settings > Applications > Vercel**, ensure the app has access to all required repositories (main + submodules).

4.  **Set Vercel Install Command:**
    -   In your Vercel project, go to **Settings > General > Build & Development Settings**.
    -   Override the **Install Command** and set it to: `pnpm vercel-install && pnpm install`.

---

## Architecture

### Multi-Repository Structure

The project is modularized using Git submodules to enhance security, scalability, and separation of concerns.

-   **`sm-workos` (Main Repo):** The application shell, managing routing, configuration, and submodule integration.
-   **`app/shared-ui` (`sm-workos-shared-ui`):** A library of reusable UI components (Buttons, Cards, etc.) and utilities.
-   **`app/domain-apps` (`sm-workos-domain-apps`):** Contains distinct, self-contained business features.
-   **`app/(dashboard)/reports` (`sm-workos-reports`):** A complete, vertical slice for the data analytics suite, including its own pages, hooks, APIs, and data source definitions.

### Authentication Flow

Authentication is handled by Supabase Auth using an email/password flow.

-   User accounts are pre-created by an administrator.
-   The `@supabase/ssr` library manages sessions securely in browser cookies.
-   A central `middleware.ts` protects all routes, redirecting unauthenticated users to `/login`.

### Data Layer

#### Data Source Architecture

The system uses a flexible, convention-over-configuration approach for data fetching, centered around a dynamic API endpoint at `/api/data-source/[name]`.

Each data source is defined by a directory under `/data-sources/[name]`, containing two key files:

1.  **`definition.ts`**: Specifies metadata, including:
    -   `source`: The data source type (e.g., `'bigquery'`, `'mysql'`).
    -   `queryFile`: The path to the SQL query file.
    -   `dimensions`: A list of columns that can be used for grouping or filtering.
    -   `metrics`: An object defining available metrics and their default aggregation method (e.g., `{ cost: 'SUM', roas: 'AVG' }`). If an array is provided, `SUM` is used by default.

2.  **`query.sql`**: Contains the raw, detailed query. It can include `@DS_START_DATE` and `@DS_END_DATE` placeholders, which are replaced before execution.

#### Dynamic Query Generation

The backend dynamically constructs the final query based on API parameters:
- The `query.sql` content (with dates replaced) is wrapped in a Common Table Expression (CTE) (e.g., `WITH raw AS (...)`).
- `SELECT`, `GROUP BY`, and `WHERE` clauses are then added to this CTE based on the `metrics`, `group_by`, and `filter_by` parameters, allowing for flexible data aggregation and filtering without modifying the base query.

#### Data Aggregation Principles

To ensure data accuracy, we follow a strict rule: **Aggregate first, then calculate.** Raw, additive metrics (like `cost`, `installs`) are summed up before calculating derived metrics (like `ROAS`, `CPI`). This prevents misleading results from averaging pre-calculated ratios.

---

## Technical Documentation

### API Endpoints

#### `GET /api/data-source/[name]`

Retrieves and processes data from a specified source.
-   **Query Parameters:**
    -   `startDate`: Required. The start date in `YYYYMMDD` format.
    -   `endDate`: Required. The end date in `YYYYMMDD` format.
    -   `group_by`: Optional. A comma-separated list of dimensions to group the data by.
    -   `filter_by`: Optional. A URL-encoded JSON object for filtering (e.g., `{"country_code":["VN","US"]}`).
    -   `metrics`: Optional. A comma-separated list of metrics to retrieve. If omitted, all defined metrics are returned.
-   **Features:** In-memory caching, BigQuery/MySQL integration, dynamic aggregation and filtering.

### UI Components

A comprehensive set of reusable components is available.

-   **Core Components:** `Button`, `Card`, `Input`, `Select`, `Dialog`, `Form` elements, `Sidebar`, etc.
-   **Custom Components:** `TaskDetailModal`, `ThemeProvider`.

*For detailed props and usage examples, please refer to the source code in the `app/shared-ui` submodule.*

### Custom Hooks

-   `useIsMobile`: Detects mobile breakpoints.
-   `useToast`: Displays toast notifications.
-   `useSidebar`: Manages sidebar state.
-   `useDatasourceQuery`: A React Query hook to fetch data from the `/api/data-source` endpoint with support for date ranges, grouping, filtering, and metric selection.

### Available Data Sources

-   **`AdjustCohortData`**: BigQuery source for mobile app cohort analysis. Provides metrics like `cost`, `install`, `REV_D0`, `REV_D30`, `retained_users_D7`, etc.

---

## Development Guidelines

### Component Development
1.  Use TypeScript.
2.  Implement accessibility features.
3.  Follow responsive design patterns.
4.  Utilize the established design system from `shared-ui`.

### API Development
1.  Implement robust error handling.
2.  Use parameterized queries to prevent injection attacks.
3.  Include request validation.
4.  Implement caching where appropriate.

### Testing
-   Unit tests for utility functions and hooks.
-   Integration tests for API endpoints.
-   Component tests with React Testing Library.
-   E2E tests for critical user flows.