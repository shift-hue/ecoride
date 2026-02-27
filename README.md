# CampusPool 🌿

> **Smart, eco-friendly campus carpooling** — reduce emissions, build trust, and commute together.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Demo Users](#demo-users)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)

---

## Overview

CampusPool is a full-stack campus ride-sharing platform that helps students and staff share rides, cut carbon footprints, and earn eco-credits. It features real-time messaging, trust-score based matching, subscription pools for recurring rides, and a live fluid background animation built with WebGL.

---

## Features

| Feature | Description |
|---|---|
| **Ride Matching** | Find and join rides by pickup zone and departure time |
| **Offer a Ride** | Drivers post seats; passengers confirm in one tap |
| **Carbon Wallet** | Every shared seat earns carbon-credits tracked over time |
| **Trust Score** | Built up through completed rides and mutual connections |
| **Inbox** | Real-time in-app messaging between riders and drivers |
| **Subscription Pools** | Recurring weekly carpool groups for daily commuters |
| **SOS Button** | Emergency glass pill button on every page — instant call to security, police, ambulance |
| **Profile** | Bio, preferences, vehicle details, verification badges |
| **Glass UI** | Full glass morphism aesthetic with LiquidEther WebGL background |

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Forms | react-hook-form + zod |
| Icons | lucide-react |
| Animation | Custom WebGL fluid sim (LiquidEther / three.js) |
| Background FX | UnicornStudio (login/register only) |

### Backend
| Layer | Technology |
|---|---|
| Framework | Spring Boot 3 |
| Language | Java 21 |
| Database | MySQL 8 |
| ORM | Spring Data JPA / Hibernate |
| Migrations | Flyway |
| Auth | JWT (Spring Security) |
| Build | Maven |

---

## Project Structure

```
ecoride/
├── backend/
│   ├── src/main/java/com/ecoride/
│   │   ├── auth/          # JWT auth, login, register
│   │   ├── carbon/        # Carbon wallet & transactions
│   │   ├── config/        # Security, CORS, beans
│   │   ├── matching/      # Ride matching engine
│   │   ├── messaging/     # In-app messaging
│   │   ├── prediction/    # Eco-impact predictions
│   │   ├── ride/          # Rides CRUD & participants
│   │   ├── subscription/  # Recurring pool management
│   │   ├── trust/         # Trust score & connections
│   │   └── user/          # User profile management
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/  # Flyway SQL migrations V1–V10
│
└── frontend/
    └── src/
        ├── app/           # Next.js pages (App Router)
        │   ├── dashboard/
        │   ├── rides/
        │   ├── my-rides/
        │   ├── offer-ride/
        │   ├── inbox/
        │   ├── wallet/
        │   ├── subscription/
        │   └── profile/
        ├── components/
        │   ├── AppShell.tsx      # Global layout + navbar + SOS
        │   ├── LiquidEther.tsx   # WebGL fluid background
        │   ├── SOSButton.tsx     # Emergency glass pill button
        │   └── ProtectedRoute.tsx
        ├── context/
        │   └── AuthContext.tsx
        └── lib/
            └── api.ts            # Typed API client
```

---

## Getting Started

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+
- MySQL 8.0+

---

### 1. Database Setup

```sql
CREATE DATABASE ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend

# Configure your DB credentials in src/main/resources/application.yml
# Then run:
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.  
Flyway will auto-run all migrations (V1–V10) including the demo seed data.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:3000**.

---

## Demo Users

Five pre-seeded demo users are inserted by migration **V10**. All share the same password:

| Name | Email | Role | Rides | Trust |
|---|---|---|---|---|
| Arjun Sharma | arjun.sharma@campus.edu | Driver + Rider | 14 | 88 |
| Priya Patel | priya.patel@campus.edu | Rider | 11 | 74 |
| Rahul Verma | rahul.verma@campus.edu | Driver + Rider | 18 | 92 |
| Sneha Reddy | sneha.reddy@campus.edu | Rider | 7 | 55 |
| Kiran Kumar | kiran.kumar@campus.edu | Driver (EV) | 12 | 80 |

**Password for all demo accounts:** `password`

> The seed data includes 15 completed rides across January 2026, carbon transactions, trust connections, in-app messages, and 2 subscription pools.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/rides` | List available rides |
| POST | `/api/rides` | Create a ride |
| POST | `/api/rides/{id}/join` | Join a ride |
| GET | `/api/rides/my` | My rides (driver + passenger) |
| GET | `/api/carbon/wallet` | Carbon wallet summary |
| GET | `/api/trust/profile/{userId}` | Trust profile |
| GET | `/api/messages` | Inbox conversations |
| POST | `/api/messages` | Send a message |
| GET | `/api/subscriptions/pools` | List pools |
| POST | `/api/subscriptions/pools` | Create a pool |
| POST | `/api/subscriptions/pools/{id}/join` | Join a pool |
| GET | `/api/users/me` | Current user profile |
| PUT | `/api/users/me` | Update profile |

---

## Environment Variables

### Backend — `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ecoride
    username: root
    password: YOUR_PASSWORD
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true

app:
  jwt:
    secret: YOUR_JWT_SECRET_KEY
    expiration-ms: 86400000
```

### Frontend — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## License

MIT © 2026 CampusPool Team
