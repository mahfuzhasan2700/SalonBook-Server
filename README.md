# SalonBook - Server (Backend API)

Backend REST API service for **SalonBook - Salon Appointment Booking Platform**. Built with Express.js, MongoDB (Mongoose), JWT role-based authentication, and Stripe payment gateway.

## Repository Links
- **Client Repository:** [SalonBook-Client](https://github.com/mahfuzhasan2700/SalonBook-Client)
- **Server Repository:** [SalonBook-Server](https://github.com/mahfuzhasan2700/SalonBook-Server)
- **Live Application:** [SalonBook Live](https://salonbook-client.vercel.app)

---

## Key Features
- **Role-Based Authentication & Authorization:** Secure JWT-based access for Customers and Administrators.
- **Customer Protection & Status Check:** Middleware verification restricting suspended/blocked users from accessing protected endpoints.
- **Salon Services Management (CRUD):**
  - Search services by name with case-insensitive regex.
  - Category filtering across 7 specialized salon categories.
  - Sorting services by price (ascending and descending).
  - Admin service status controls (`active` vs. `inactive`).
- **Conflict-Free Appointment Scheduling:**
  - Automated check preventing duplicate active appointments on identical dates and time slots.
  - Customer self-service cancellation exclusively for pending requests.
  - Admin controls for confirming pending appointments and cancelling bookings.
- **Secure Stripe Payment Integration:**
  - Stripe Checkout Session generation for confirmed appointments.
  - Cryptographically verified Stripe webhook listener ensuring payment status is only updated upon successful Stripe events.
  - Transaction ledger tracking customer payments, session references, and amounts.
- **Dashboard Analytics:** Comprehensive statistics calculation for both customer and admin overview panels.

---

## Technology Stack
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (ES Modules)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (jsonwebtoken), bcryptjs
- **Payment Processing:** Stripe Node SDK & Webhooks
- **Security:** CORS, environment variable isolation

---

## Database Architecture
MongoDB collections with relational references:
- **`users`:** Customer and Administrator profiles, credentials, role tags, and block statuses.
- **`services`:** Salon services catalog, pricing, duration, category, and active status.
- **`appointments`:** Booking records linking customer and service with date, slot, notes, and statuses (`pending`, `confirmed`, `cancelled`).
- **`transactions`:** Verified financial transaction logs tied to appointments and Stripe session IDs.

---

## Environment Variables
Create a `.env` file in the root directory following `.env.example`:
- `PORT` - Port number the API server binds to (default: `5000`)
- `MONGODB_URI` - MongoDB Atlas or local connection URI
- `JWT_SECRET` - Cryptographic key for signing JWT tokens
- `STRIPE_SECRET_KEY` - Stripe secret key for creating Checkout Sessions
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret for verifying events
- `CLIENT_URL` - Origin URL of the frontend application for CORS

---

## Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mahfuzhasan2700/SalonBook-Server.git
   cd SalonBook-Server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   # Update MONGODB_URI, JWT_SECRET, STRIPE_SECRET_KEY with your values
   ```

4. **Seed Initial Database (Optional but Recommended):**
   ```bash
   npm run seed
   ```
   *Creates admin account (`admin@salonbook.com`), sample customer, and 12 premium services.*

5. **Run the server in development mode:**
   ```bash
   npm run dev
   ```

6. **Start production server:**
   ```bash
   npm start
   ```

---

## API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register customer account |
| POST | `/api/auth/login` | Public | Authenticate user & get JWT |
| POST | `/api/auth/google` | Public | Google OAuth sync & login |
| GET | `/api/auth/me` | Authenticated | Retrieve profile details |
| PATCH | `/api/users/profile` | Authenticated | Update user profile |
| GET | `/api/services` | Public | Search, filter, and sort active services |
| GET | `/api/services/:id` | Public | Retrieve single service details |
| POST | `/api/services` | Admin | Create new salon service |
| PATCH | `/api/services/:id` | Admin | Update service information |
| DELETE | `/api/services/:id` | Admin | Remove service |
| POST | `/api/appointments` | Customer | Submit new appointment request |
| GET | `/api/appointments/my` | Customer | Retrieve personal appointment history |
| PATCH | `/api/appointments/:id/cancel` | Customer | Cancel pending appointment |
| GET | `/api/appointments/admin/all` | Admin | View all platform appointments |
| PATCH | `/api/appointments/admin/:id/status` | Admin | Confirm or cancel booking |
| POST | `/api/payments/create-checkout-session` | Customer | Initiate Stripe payment for confirmed booking |
| POST | `/api/payments/webhook` | Stripe | Handle verified payment confirmation |
| GET | `/api/payments/transactions` | Admin | Audit all transactions |
| GET | `/api/admin/stats` | Admin | Retrieve administrative overview statistics |
| GET | `/api/admin/users` | Admin | List all registered customers |
| PATCH | `/api/admin/users/:id/block` | Admin | Toggle block status for a customer |
