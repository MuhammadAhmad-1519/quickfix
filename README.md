# QuickFix — Lahore Home Services Marketplace (MVP)

> **"Your problem. Your choice. Fixed fast."**

QuickFix is a modern, mobile-first home services marketplace launched initially for **Lahore, Pakistan**. It connects homeowners experiencing plumbing, electrical, or AC problems with verified local professionals.

The foundational design principle of QuickFix is: **The customer always chooses the technician** from 3–5 matched, verified professionals. QuickFix never auto-assigns technicians.

---

## 🌟 Key Features

### 1. Customer Experience
- **Problem Reporting Wizard**: Multi-step wizard covering Plumbing, Electrical, and Inverter AC repairs with predefined common Lahore home issues.
- **Gemini AI Problem Triage**: Real-time preliminary triage powered by Google Gemini (`gemini-3.6-flash`), recommending safety steps and issue analysis with clear disclaimers.
- **Customer Choice Matching**: Deterministic scoring engine calculates distance from Lahore neighborhoods (Gulberg, DHA, Model Town, Johar Town, Cantt, etc.), availability, experience, and ratings to present 3–5 verified technicians for customer selection.
- **Live Status Stepper**: Real-time visual progression tracking all 14 lifecycle states from Request to Arrival, Inspection, Repair, Payment, and Review.
- **On-Site Price Inspection & Approval**: Technicians physically inspect the issue and submit a final price quote on-site; work begins **only after customer approval**.
- **Cash Payment & Review**: Customer inspects the repair, pays cash on-site, confirms completion, and leaves a 1–5 star rating and written review.
- **Dispute Resolution**: In-app dispute reporting with category classification and admin arbitration.
- **QuickFix AI Chatbot**: Conversational home maintenance assistant with safety guardrails (detects burning wires, gas leaks, and flooding, advising emergency evacuation to Rescue 1122).

### 2. Technician Portal
- **Professional Onboarding**: CNIC verification, trade skills, service areas, and experience tracking with administrative approval workflow.
- **Availability Controls**: One-tap toggles for `Available Now`, `Scheduled Later`, `Offline`, and `Emergency Dispatch`.
- **Selected Job Requests**: Technicians receive incoming jobs selected specifically by customers with direct Accept/Decline actions.
- **Job Execution Screen**: Step-by-step field execution: `Mark En Route` → `Mark Arrived` → `Start Inspection` → `Submit Final Price` → `Start Repair` → `Mark Completed` → `Confirm Cash Payment`.
- **Transparent Earnings Breakdown**: Live financial calculator displaying gross job volume, QuickFix platform commission deduction (default 15%), and net technician take-home pay.

### 3. Admin Control Center
- **Executive KPI Dashboard**: Total customers, verified technicians, pending applications, active bookings, completed jobs, GMV, and platform commission earned.
- **Technician Verification Queue**: Review submitted CNICs and credentials; Approve, Reject, or Suspend profiles with audit notes.
- **Bookings Ledger**: Searchable, filterable ledger of all home repairs across Lahore with financial breakdowns.
- **Dispute Arbitration**: Review customer complaints, inspect evidence, and publish binding resolution decisions.
- **Platform Configuration**: Live, centralized commission rate adjuster (e.g. 15%), emergency multipliers, and audit logs.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & Lucide Icons (Responsive, Mobile-First PWA-ready)
- **Database**: MongoDB Atlas with official Node.js driver (`mongodb`) & connection pooling singleton, featuring a seamless in-memory fallback store for offline/unwhitelisted environments.
- **AI Engine**: Google Gemini API via official `@google/genai` JavaScript SDK
- **Authentication**: Secure JWT sessions via `jose` and `httpOnly` cookies with `bcryptjs` password hashing.
- **Deployment Target**: Vercel

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies

```bash
cd "quick fix"
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory (refer to `.env.example`):

```env
MONGODB_URI=mongodb+srv://seerupclaude_db_user:ahmad1519@cluster0.72mcmkm.mongodb.net/quickfix?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=quickfix
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
AUTH_SECRET=quickfix_secret_jwt_secure_key_lahore_2025_market_prod_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **MongoDB Atlas Network Access Note**: To allow direct connection to your MongoDB Atlas cluster from your local development machine, ensure your current IP address (or `0.0.0.0/0`) is whitelisted under **Network Access** in the MongoDB Atlas dashboard. QuickFix includes an automatic high-reliability fallback store pre-loaded with Lahore seed data so the application remains 100% operational even if the Atlas network access list is pending.

### 3. Seed the Database

Populate test accounts, verified Lahore technicians, admin settings, and sample bookings:

```bash
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Accounts for Testing

QuickFix includes a **One-Click Demo Switcher** on the login page (`/login`):

| Role | Name | Email | Password | Location / Specialty |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Ahmad Khan | `ahmad@quickfix.local` | `CustomerPass123!` | Gulberg, Lahore |
| **Customer 2** | Sara Malik | `sara@quickfix.local` | `CustomerPass123!` | DHA Phase 5, Lahore |
| **Plumber** | Tariq Mehmood | `tariq.plumber@quickfix.local` | `TechPass123!` | Gulberg (Central Lahore) |
| **Electrician** | Usman Ali | `usman.electric@quickfix.local` | `TechPass123!` | DHA Phase 5 & 6 |
| **AC Specialist** | Muhammad Rashid | `rashid.ac@quickfix.local` | `TechPass123!` | Model Town, Lahore |
| **Admin** | QuickFix Admin | `admin@quickfix.local` | `AdminPass123!` | Lahore Operations HQ |

---

## 🔄 End-to-End User Verification Workflow

1. **Customer Request**:
   - Log in as `ahmad@quickfix.local`.
   - Tap **"What needs fixing?"** and select **Plumbing** → **Water Pipe / Joint Leak**.
   - Review the **Gemini AI preliminary triage** analysis.
   - QuickFix presents 3 verified plumbers in Lahore.
   - Compare ratings, distance, and ETAs, then **choose Tariq Mehmood**.
2. **Technician Job Flow**:
   - Switch accounts to `tariq.plumber@quickfix.local`.
   - On the Technician Dashboard, view the incoming request from Ahmad Khan and tap **Accept Job**.
   - Tap **Mark En Route** → **Mark Arrived** → **Start Inspection**.
   - Enter the on-site inspected final price: `2200` (shows live commission breakdown: QuickFix Rs. 330, Technician take-home Rs. 1,870).
   - Tap **Submit Price Quote**.
3. **Price Approval & Completion**:
   - Switch back to customer `ahmad@quickfix.local` at `/customer/bookings/[id]`.
   - Review and tap **Approve Rs. 2,200 & Begin Repair**.
   - Switch to technician and tap **Start Repair Work** → **Mark Repair Completed**.
   - Customer inspects repair, hands over cash, and taps **Confirm Cash Payment Handed Over**.
   - Customer submits a 5-star review.
4. **Admin Overview**:
   - Log in as `admin@quickfix.local`.
   - View the updated gross volume and platform commission earned in the **Overview KPIs**.
   - Go to **Technicians** tab to review and approve pending applicant Kamran Butt.
   - Adjust the platform commission percentage under **Platform Settings**.

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Import the project into your [Vercel Dashboard](https://vercel.com).
3. Under **Project Settings → Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `MONGODB_DB_NAME`: `quickfix`
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `GEMINI_MODEL`: `gemini-3.6-flash`
   - `AUTH_SECRET`: A secure 32+ character random string.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production deployment URL (e.g. `https://quickfix-lahore.vercel.app`).
4. Ensure MongoDB Atlas **Network Access** contains `0.0.0.0/0` (Allow Access from Anywhere) so Vercel serverless functions can connect.
5. Click **Deploy**. Vercel will execute `npm run build` and launch the application.

---

## 🔒 Security & Architecture Guardrails

- **Zero Client-Side Secrets**: MongoDB credentials, JWT secret keys, and Gemini API keys are accessible strictly on the server side.
- **IDOR Protection**: Customers cannot access other customers' bookings; technicians cannot view unassigned jobs or other technicians' private CNIC data.
- **Server-Side Authorization**: Booking state transitions, commission calculations, and verification statuses are strictly enforced on the server.
- **Life-Safety AI Filters**: Gemini assistant actively filters hazard queries (gas leaks, live high-voltage wires, fires), giving immediate safety and evacuation instructions (Rescue 1122).
