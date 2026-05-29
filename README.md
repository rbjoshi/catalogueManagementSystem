# Case Study: CatalogueHub - Enterprise Catalogue Management System

**CatalogueHub** is a comprehensive, multi-tenant SaaS application designed to streamline the way enterprises manage, design, and distribute their product catalogues. Built with scalability and user experience in mind, it provides businesses with an end-to-end solution for inventory classification, interactive catalogue design, and asynchronous PDF generation.

---

## 🚀 The Business Problem

Large enterprises and distributors often struggle with:
- Managing vast product inventories with complex, hierarchical classifications (Types, Sub-Types, Brands, and Sizes).
- Creating customized, visually appealing product catalogues for different clients or seasons.
- Generating high-quality PDF exports of their catalogues efficiently without blocking the user interface.
- Ensuring data isolation across different enterprise accounts in a SaaS environment.

## 💡 The Solution

I architected and developed a full-stack **Catalogue Management System** that allows enterprises to securely log in, manage their rich product data, and visually design catalogues using an interactive drag-and-drop interface.

### Key Highlights:
1. **True Multi-Tenancy**: Data isolation is enforced at the database layer using unique Enterprise IDs (`ent_id`), ensuring robust security for SaaS operations.
2. **Advanced Hierarchical Lookups**: Complete CRUD functionality for deeply nested classification data, including custom fields for Sizes (supporting decimals and dynamic arrays).
3. **Interactive Catalogue Designer**: A React-based layout builder allowing users to seamlessly position items across multiple pages and customize layouts using predefined templates.
4. **Asynchronous PDF Generation**: Background processing system for generating heavy PDF catalogues, complete with a job polling mechanism to update the UI without freezing the browser.

---

## 🛠️ Technology Stack

I selected a modern, robust, and scalable technology stack:

**Frontend (Client-Side)**
- **React 18 & TypeScript**: For building a type-safe, highly interactive user interface.
- **Tailwind CSS & Lucide React**: For a premium, responsive, and customizable design system.
- **Zustand & React Query**: For efficient client-side state management and asynchronous data fetching.
- **dnd-kit**: Powering the drag-and-drop catalogue designer.
- **Vite**: For lightning-fast local development and optimized production builds.

**Backend (Server-Side)**
- **Java 17 & Spring Boot 3.2**: A robust enterprise-grade framework for RESTful API development.
- **Spring Security & JWT**: Stateless, secure authentication and role-based access control.
- **Hibernate 6 & Spring Data JPA**: For complex ORM and database querying.
- **iText7**: For programmatic, server-side PDF generation.

**Infrastructure & Data**
- **PostgreSQL 16**: Relational database managing complex JSONB layouts and hierarchical data.
- **Flyway**: Automated database migrations for seamless CI/CD rollouts.
- **Redis 7**: In-memory caching layer to optimize frequent lookups and reduce database load.
- **Docker**: Containerized services for simple deployment and local environment orchestration.

---

## 🏗️ Architecture & Core Features

### 1. Robust Data Modeling
The database schema utilizes `JSONB` extensively for flexible attributes (like `images`, `tags`, and `layout_json` for the designer) while maintaining strict relational integrity for core business logic (Items, Types, Brands).

### 2. Full-Stack CRUD Operations
Built complete lifecycle management for complex entities. For example, the `Size` entity was extended to support both numeric constraints and dynamic arrays (`size_list`), demonstrating the ability to handle evolving business requirements seamlessly across the Java backend and React frontend.

### 3. Asynchronous PDF Engine
Generating large PDF catalogues can be resource-intensive. I implemented an asynchronous job queue using `pdf_jobs`. The frontend initiates the request, receives a `job_id`, and gracefully polls the server using React Query until the PDF is ready for download.

### 4. Performance Optimizations
Implemented Redis caching on the backend for frequently accessed `Lookups` (Types, Brands, Sizes). Caches are intelligently evicted whenever an entity is modified, ensuring high performance without stale data.

---

## 📂 Project Structure

```text
catalogue-system/
├── backend/                       # Java / Spring Boot Backend
│   ├── src/main/java/com/catalogue/
│   │   ├── config/                # Security & Redis Configurations
│   │   ├── controller/            # REST API Endpoints
│   │   ├── dto/                   # Request/Response Data Transfer Objects
│   │   ├── entity/                # JPA Database Entities
│   │   ├── repository/            # Spring Data Repositories
│   │   ├── security/              # JWT Filters & Auth Logic
│   │   └── service/               # Core Business Logic
│   └── src/main/resources/
│       └── db/migration/          # Flyway SQL Scripts
│
├── frontend/                      # React / TypeScript Frontend
│   └── src/
│       ├── api/                   # Axios Client & API Services
│       ├── components/            # Reusable UI Components
│       ├── pages/                 # Routing Pages (Designer, Dashboard, etc.)
│       └── store/                 # Zustand State Management
└── docker-compose.yml             # Local Environment Setup
```

---

## 🚀 Quick Start (Local Development)

Want to run this project locally? Follow these steps to get everything up and running.

### Prerequisites
Ensure you have the following installed on your local machine:
- **Java 17** or higher
- **Node.js 18** or higher
- **Docker** and **Docker Compose**
- **Maven** (optional, you can use the included wrapper if available)

### 1. Start Infrastructure via Docker
The system relies on PostgreSQL and Redis. You can easily start these services using Docker Compose.
```bash
# From the root of the project, start Postgres and Redis in the background
docker-compose up -d
```

### 2. Run the Backend (Spring Boot)
The backend is a Spring Boot application built with Java 17.
```bash
cd backend

# Build and run the application using Maven
mvn clean install
mvn spring-boot:run

# The API will be available at: http://localhost:8080/api
# Swagger Documentation:  http://localhost:8080/api/swagger-ui.html
```

### 3. Run the Frontend (React / Vite)
The frontend is a modern React application built with Vite.
```bash
cd frontend

# Install all necessary dependencies
npm install

# Start the development server
npm run dev

# The application will be available at: http://localhost:5173
```

---

## 🤝 Let's Work Together
If you are looking for an experienced Full-Stack Engineer who understands how to bridge complex enterprise backend architecture with beautiful, modern frontend interfaces, let's connect!
