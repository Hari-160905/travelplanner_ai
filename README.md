# AI Travel Planner

A full-stack travel planning and expense optimization platform built with React, Express, MySQL, JWT auth, and Google Gemini AI.

## Project Overview

AI Travel Planner provides authenticated users with trip management, expense tracking, AI-powered travel planning and budgeting, and a responsive dashboard experience.

### Key Features

- User registration, login, logout, and profile management
- Secure JWT authentication and password hashing
- Create, update, delete, and search trips
- Add, edit, delete expenses with category tracking
- Monthly expense reports and budget summaries
- AI Trip Planner, Packing List, Budget Optimizer, and Travel Chatbot powered by Google Gemini
- Responsive React frontend with navigation, sidebar, and notifications
- Docker-ready backend and database configuration

## Architecture

The app is separated into:

- `client/` — React + Vite frontend
- `server/` — Express backend API
- `database/` — MySQL schema and sample data
- `docs/` — project documentation assets

## Folder Structure

```
projecta1/
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── package.json
│   ├── server.js
│   └── .env.example
├── database/
│   └── schema.sql
└── README.md
```

## API Documentation

All backend routes are prefixed with `/api`.

### Authentication

- `POST /api/auth/register`
  - Request body: `{ name, email, password }`
  - Response: `{ user, token }`

- `POST /api/auth/login`
  - Request body: `{ email, password }`
  - Response: `{ user, token }`

- `POST /api/auth/logout`
  - Protected route
  - Response: `{ message }`

- `GET /api/user/profile`
  - Protected route
  - Response: `{ user }`

### Trips

- `GET /api/trips`
  - Protected route
  - Query params: `search`, `destination`, `startDate`, `endDate`, `minBudget`, `maxBudget`, `limit`, `offset`, `sort`
  - Response: `{ count, trips }`

- `GET /api/trips/:id`
  - Protected route
  - Response: trip details

- `POST /api/trips`
  - Protected route
  - Request body: `{ title, destination, startDate, endDate, budget, notes }`
  - Response: created trip

- `PUT /api/trips/:id`
  - Protected route
  - Request body: same as POST
  - Response: updated trip

- `DELETE /api/trips/:id`
  - Protected route
  - Response: `{ message }`

### Expenses

- `GET /api/expenses`
  - Protected route
  - Query params: `tripId`, `category`, `startDate`, `endDate`, `limit`, `offset`
  - Response: `{ count, expenses }`

- `GET /api/expenses/:id`
  - Protected route
  - Response: expense details

- `POST /api/expenses`
  - Protected route
  - Request body: `{ tripId, category, amount, currency, description, spentAt }`
  - Response: created expense

- `PUT /api/expenses/:id`
  - Protected route
  - Request body: same as POST
  - Response: updated expense

- `DELETE /api/expenses/:id`
  - Protected route
  - Response: `{ message }`

- `GET /api/expenses/summary`
  - Protected route
  - Response: `{ total, categories, monthly }`

- `GET /api/expenses/monthly-report?year=YYYY&month=MM`
  - Protected route
  - Response: monthly expense report

- `GET /api/expenses/budget-remaining?tripId=ID`
  - Protected route
  - Response: `{ budget, spent, remaining }`

### AI Endpoints

- `POST /api/ai/trip-planner`
  - Protected route
  - Request body: `{ destination, budget, days, interests }`
  - Response: `{ prompt, result }`

- `POST /api/ai/packing-list`
  - Protected route
  - Request body: `{ destination, season }`
  - Response: `{ prompt, result }`

- `POST /api/ai/budget-optimizer`
  - Protected route
  - Request body: `{ currentExpenses, budget }`
  - Response: `{ prompt, result }`

- `POST /api/ai/chat`
  - Protected route
  - Request body: `{ question }`
  - Response: `{ prompt, result }`

- `GET /api/ai/history`
  - Protected route
  - Response: AI request history

## Installation Guide

### Prerequisites

- Node.js 18+ and npm
- MySQL 8+
- Git
- Google Gemini API access

### MySQL Setup

1. Start MySQL server.
2. Create the database and user:

```sql
CREATE DATABASE aitours CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'apppassword';
GRANT ALL PRIVILEGES ON aitours.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

3. Import the schema:

```bash
mysql -u appuser -p aitours < database/schema.sql
```

### Backend Setup

1. Navigate to the server folder:

```bash
cd projecta1/server
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example` and set values:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=aitours
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the server:

```bash
npm start
```

### Frontend Setup

1. Navigate to the client folder:

```bash
cd projecta1/client
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend app:

```bash
npm run dev
```

## Google Gemini API Setup

1. Obtain a Google Gemini API key from your Google Cloud console.
2. Set `GEMINI_API_KEY` in `projecta1/server/.env`.
3. Optionally adjust `GEMINI_URL` if you are using a custom endpoint.
4. Restart the backend after updating environment variables.

## Running the App

- Backend: `cd projecta1/server && npm start`
- Frontend: `cd projecta1/client && npm run dev`

Visit the frontend URL printed by Vite (typically `http://localhost:3000`).

## Project Screenshots

![Dashboard Placeholder](docs/dashboard-placeholder.png)

![AI Assistant Placeholder](docs/ai-placeholder.png)

![Trips Page Placeholder](docs/trips-placeholder.png)

## Notes

- Use `error.message` and response payloads for debugging API issues.
- Ensure the backend runs before using the frontend.
- The frontend stores JWT tokens in `localStorage` for simplicity.

## Future Enhancements

- Add refresh token support for improved security.
- Implement user roles and permissions.
- Add file upload for travel documents.
- Add real-time notifications and WebSocket updates.
- Improve AI prompts using fine-tuning and structured output.
