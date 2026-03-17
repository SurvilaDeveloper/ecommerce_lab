# 🛒 Commerce Lab

Mini plataforma de e-commerce full stack desarrollada con **Spring
Boot + Next.js**, diseñada como base para un sistema real de venta
online.

------------------------------------------------------------------------

## 🚀 Stack Tecnológico

### Backend

-   Java 21
-   Spring Boot 4
-   Spring Security (JWT + cookies HttpOnly)
-   JPA / Hibernate
-   PostgreSQL
-   Flyway (migraciones)
-   Maven

### Frontend

-   Next.js (App Router)
-   TypeScript
-   Tailwind CSS

------------------------------------------------------------------------

## 📦 Arquitectura

Monorepo:

    commerce-lab/
    ├── backend/    # API REST (Spring Boot)
    ├── frontend/   # UI (Next.js)

------------------------------------------------------------------------

## 🔐 Autenticación

Sistema de auth propio con:

-   Signup / Login
-   Password hashing (BCrypt)
-   JWT firmado
-   Cookie HttpOnly (`access_token`)
-   Endpoint `/api/auth/me` para sesión

------------------------------------------------------------------------

## ▶️ Cómo ejecutar

### Backend

    cd backend
    ./mvnw spring-boot:run

### Frontend

    cd frontend
    npm install
    npm run dev

------------------------------------------------------------------------

## 📌 Estado del proyecto

🚧 En desarrollo

------------------------------------------------------------------------

## 👨‍💻 Autor

Gabriel Survila
