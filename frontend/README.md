# Yangon Focus - Frontend

React frontend for the Yangon Focus hostel management platform.

## Tech Stack

- **React 18** with Vite
- **React Router** for navigation
- **TanStack Query** for data fetching and caching
- **Axios** for API requests with Sanctum authentication
- **Tailwind CSS** for styling

## Project Structure

```
src/
├── api/          # API client configuration
├── components/   # Reusable React components
├── hooks/        # Custom React hooks
├── pages/        # Page components
└── services/     # Business logic and API services
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## API Configuration

The API client is configured to connect to:
- Base URL: `http://localhost:8000/api/v1`
- Credentials: Enabled for Sanctum CSRF protection
- CSRF Cookie Endpoint: `http://localhost:8000/sanctum/csrf-cookie`

## Authentication

Authentication uses Laravel Sanctum with CSRF protection. The login flow:
1. Fetch CSRF cookie from `/sanctum/csrf-cookie`
2. POST credentials to `/api/v1/login`
3. Receive user data and authentication token
