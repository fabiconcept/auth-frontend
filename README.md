# Auth Dashboard – Frontend Solution

This project is the **frontend implementation** for the SaaS authentication system described in the technical assessment. It uses **React 18** and **Redux Toolkit Query** to manage JWT-based authentication with secure cookie handling.

## Configuration

### Environment Variables

Create a `.env.local` file in the root of your project and set your backend API URL:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5222
```

## Backend API Endpoints Expected

This frontend expects the following backend endpoints to be implemented:

* `POST /api/auth/login` – Login with email/password
* `POST /api/auth/refresh` – Refresh access token
* `POST /api/auth/logout` – Logout and clear session
* `GET /api/users/me` – Get current user profile

## Features

✅ JWT access tokens stored in Redux (in-memory only)
✅ Refresh tokens handled securely via httpOnly cookies
✅ Automatic token refresh on 401 responses
✅ Protected routes with authentication checks
✅ Graceful logout if refresh fails or is revoked
✅ CORS and credential handling
✅ No usage of `localStorage` to prevent XSS token theft

## Usage

1. Start your backend server and ensure it exposes the endpoints listed above.
2. Update `NEXT_PUBLIC_API_URL` in `.env.local` to match your backend.
3. Run the frontend with `npm run dev` or `yarn dev`.

---

Let me know if you also need a `README.md` for the backend part or want to include setup instructions for a specific stack (like Node/Express or NestJS).