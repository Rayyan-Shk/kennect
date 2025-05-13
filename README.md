# Kennect Tech Projects

This repository contains three distinct projects showcasing different aspects of software development and system design.

## Project Overview

### 1. Autonomous Delivery Fleet System (Task 1)

A comprehensive system design documentation for an autonomous delivery fleet system. This project includes high-level and low-level design documents, flow charts, and legal documentation.

**Key Features:**

- Fleet Management Service
- Vehicle Communication Service
- Route Optimization Service
- Customer Service
- Security Architecture
- Monitoring & Observability

[View Detailed Documentation →](task-1/README.md)

### 2. GitHub Issue Analyzer (Task 2)

A Next.js application that analyzes GitHub repository issues and provides detailed metrics and visualizations.

**Key Features:**

- Issue Status Analysis
- Weekly Issue Activity
- Weekly Closure Rate
- New vs Closed Issues Ratio
- Comprehensive Issue List

**Live Demo:** [kennect.vercel.app](https://kennect.vercel.app)

[View Project Details →](task-2/README.md)

### 3. Date Calculator API (Task 3)

A Node.js and TypeScript-based HTTP server that performs date arithmetic calculations using natural language queries.

**Key Features:**

- Add/subtract days/weeks from dates
- Natural language query format
- Simple and intuitive API
- TypeScript implementation

**Live Demo:** [kennect-kxon.onrender.com](https://kennect-kxon.onrender.com)

[View Project Details →](task-3/README.md)

## Getting Started

Each project has its own setup instructions and requirements. Please refer to the individual project README files for detailed setup instructions:

1. [Task 1 Setup Guide](task-1/README.md)
2. [Task 2 Setup Guide](task-2/README.md)
3. [Task 3 Setup Guide](task-3/README.md)

## Tech Stack Overview

- **Task 1:** System Design Documentation
- **Task 2:** Next.js, TypeScript, Tailwind CSS, Chart.js
- **Task 3:** Node.js, TypeScript, Express.js

## Running with Docker

You can start both projects with a single command using Docker Compose.

### Prerequisites

- Docker and Docker Compose installed on your system

### Steps to Run

1. Clone this repository
2. From the root directory, run:

```bash
docker-compose up -d
```

3. Access the applications at:
   - Task 2 (GitHub Issue Analyzer): http://localhost:3000
   - Task 3 (Date Calculator API): http://localhost:3001

### To Stop

```bash
docker-compose down
```

## Individual Project Descriptions

### Task 2: GitHub Issue Analyzer (Next.js)

A web application built with Next.js for analyzing GitHub issues.

### Task 3: Date Calculator API (Express)

A simple REST API for date calculations that can:

- Add days/weeks to dates
- Subtract days/weeks from dates

Example endpoints:

- http://localhost:3001/date?q=add, 6 days to today
- http://localhost:3001/date?q=subtract, 187 days from 12-Jan-2019
