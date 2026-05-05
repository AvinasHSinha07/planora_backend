# Planora API | High-Performance Event Infrastructure Engine

The **Planora API** is the architectural foundation of the Planora ecosystem. Built with a domain-driven modular approach, it orchestrates complex authentication, multi-role data flows, AI processing, and secure financial transactions.

---

## 🏗️ Core Backend Features

### 1. 🔐 Enterprise-Grade Authentication
- **Better Auth Integration**: Advanced session management with support for role-based access control (RBAC).
- **Secure Middleware Stack**: Validates user identity and role permissions (User, Organizer, Admin) before every request.

### 2. 📊 Relational Data Orchestration
- **Prisma & PostgreSQL**: Complex schema management for events, participants, invitations, reviews, and payments.
- **Transaction Safety**: Atomic database operations ensure data consistency during payment processing and registration.

### 3. 💳 Secure Fiscal Engine
- **Stripe Integration**: Dynamic checkout session generation and secure webhook handling.
- **Webhook Signature Verification**: Protects the platform from fraudulent payment requests.
- **Revenue Logic**: Automated calculation of platform fees and organizer earnings.

### 4. 🤖 AI Service Layer
- **Contextual Querying**: Interfaces with AI models to provide context-aware event recommendations based on the current database state.
- **Prompt Engineering**: Proprietary system prompts ensure the AI assistant remains helpful, professional, and focused on the event ecosystem.

---

## 📡 API Reference

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/sign-up` | Create a new user identity with role assignment. |
| `POST` | `/sign-in` | Establish a secure session. |
| `GET` | `/get-session` | Retrieve current session and role metadata. |

### 📅 Event Management (`/api/v1/events`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | List all events with advanced filtering (search, category, status). |
| `POST` | `/` | Create a new event (Organizer/Admin only). |
| `GET` | `/:id` | Retrieve detailed event metadata and attendance. |
| `PATCH` | `/:id` | Update event details (Owner/Admin only). |
| `DELETE` | `/:id` | Permanently remove an event from the ecosystem. |
| `POST` | `/:id/toggle-featured` | Promote an event to the global homepage (Admin only). |

### 👥 Participation (`/api/v1/participations`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Register for an event (Free or initiates payment for Paid). |
| `PATCH` | `/:id/status` | Approve, Reject, or Ban a participant (Organizer only). |
| `GET` | `/my-participations`| List events the current user is attending. |

### 📨 Invitations (`/api/v1/invitations`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Send a direct invitation to a user (Organizer only). |
| `PATCH` | `/:id/respond` | Accept or decline a pending invitation. |
| `GET` | `/` | List all invitations received by the current user. |

### 💰 Payments (`/api/v1/payments`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/create-checkout-session`| Generate a secure Stripe checkout URL. |
| `POST` | `/webhook` | Handle asynchronous Stripe event notifications (signed). |

### 🤖 AI & Analytics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/ai/chat` | Interface with PlanoraBot for event discovery. |
| `GET` | `/admin/stats` | Retrieve global platform growth and revenue metrics (Admin only). |
| `GET` | `/users/dashboard-stats` | Context-aware metrics for the current role's dashboard. |

---

## 🔄 Technical Workflows

### 💰 Secure Payment Lifecycle
1. **Frontend Request**: Organizer initiates a registration request for a paid event.
2. **Session Creation**: Backend generates a unique Stripe session.
3. **External Checkout**: User completes payment on Stripe's secure portal.
4. **Webhook Callback**: Stripe sends a signed `checkout.session.completed` event to the backend.
5. **State Synchronization**: Backend verifies the signature and updates the participation status.

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── config/           # Database, Stripe, and Auth configurations
│   ├── middleware/       # RBAC, Global Error Handling, and Validation
│   ├── module/           # Domain-driven feature sets (Admin, AI, Event, etc.)
│   ├── routes/           # Centralized API route mapping
│   └── utils/            # Shared response formatters and helpers
├── app.ts                # Express app initialization
└── server.ts             # Server bootstrap and DB connection
```

---

## ⚙️ Setup & Deployment

1. **Clone & Install**: `npm install`
2. **Env Config**: Set `DATABASE_URL`, `STRIPE_SECRET_KEY`, and `BETTER_AUTH_SECRET`.
3. **Database**: `npx prisma migrate dev && npx prisma db seed`
4. **Start**: `npm run dev`

---

## 🔐 Demo Credentials

- **Admin**: `admin@planora.com` (Pass: `admin123`)
- **Organizer**: `organizer@planora.com` (Pass: `organizer123`)
- **User**: `ac@gmail.com` (Pass: `asdfghjk`)

---

## 📄 License
Developed for the **Next Level Web Development** Capstone Project.
