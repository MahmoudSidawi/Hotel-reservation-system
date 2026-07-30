# 🎛️ Velora Admin Dashboard — Technical & Presentation Guide

> **Executive Overview:** A high-performance, modular management console built into Velora Hotel System. It empowers hotel operations teams (Managers, Receptionists, Housekeeping, and Maintenance) with real-time operational control, financial analytics, room allocation, and RBAC user security.

---

## 🛠️ Technology Stack Used in the Admin Dashboard

| Technology | Role & Feature Implementation |
| :--- | :--- |
| **Next.js 16 (App Router)** | Client-side dashboard routing (`/admin`) and serverless REST API endpoints (`/api/admin/...`). |
| **React 19 & Lazy Loading** | **`React.lazy` + `Suspense`** code-splitting for all 10 dashboard tabs to achieve instant page loads and minimal JavaScript bundle size. |
| **Recharts Library** | Interactive vector charts (Revenue trends, Occupancy rates, Category breakdowns) with custom tooltips. |
| **TailwindCSS & Lucide Icons** | Premium dark-slate theme (`#090D16`) with gold accents (`#D4AF37`), responsive drawers, and modern SVG vector icons. |
| **MongoDB & Mongoose** | Real-time database queries with relational `.populate()` (linking Users, Rooms, Room Types, & Reservations). |
| **Polling & Real-time Badges** | Automated 30-second interval polling (`useUnreadCount`) for unread maintenance and booking alerts. |
| **JWT Session Security (`useAuth`)** | Role-Based Access Control (RBAC) protecting endpoints and admin interface tabs based on user permissions. |

---

## 🧩 Section-by-Section Breakdown (10 Dashboard Tabs)

### 1. 📊 Executive Overview (`OverviewTab.tsx`)
- **What it does:** Central command cockpit providing real-time operational metrics.
- **Key Features:**
  - **KPI Cards:** Live Total Revenue, Occupancy Rate %, Active Bookings, and Available Rooms.
  - **Revenue & Occupancy Graphs:** Interactive Recharts visual analytics.
  - **Activity Feed:** Live log of recent guest check-ins, reservations, and maintenance warnings.

### 2. 🛏️ Room Inventory (`RoomsTab.tsx`)
- **What it does:** Complete control over physical rooms and pricing schedules.
- **Key Features:**
  - Status filtering (`Available`, `Occupied`, `Maintenance`, `Cleaning`).
  - Nightly base rate modification & room type assignment.
  - Floor number configuration & room amenity management.

### 3. 📅 Availability Calendar (`CalendarTab.tsx`)
- **What it does:** Visual timeline grid for room bookings.
- **Key Features:**
  - Timeline view mapping rooms against calendar dates.
  - Helps receptionists instantly spot booking overlaps, upcoming arrivals, and vacant slots.

### 4. 📑 Reservations Management (`ReservationsTab.tsx`)
- **What it does:** End-to-end guest booking lifecycle management.
- **Key Features:**
  - Status filters (`Confirmed`, `Checked-In`, `Checked-Out`, `Cancelled`).
  - **1-Click Actions:** Check-in guest, Check-out guest, or cancel reservation.
  - Walk-in booking creation & automated total price calculation.

### 5. 👤 Guest Profiles & CRM (`GuestsTab.tsx`)
- **What it does:** Comprehensive guest directory and stay history.
- **Key Features:**
  - Full list of hotel guests with contact details.
  - Lifetime stay counts, total expenditure tracking, and VIP guest badges.

### 6. 🛡️ Staff & User Management (`StaffTab.tsx`)
- **What it does:** Security administration & Role-Based Access Control (RBAC).
- **Key Features:**
  - Create and manage employee accounts.
  - Assign roles (`Admin`, `Manager`, `Receptionist`, `Housekeeping`, `Maintenance`).
  - Password resets & permission enforcement.

### 7. 🔧 Maintenance & Work Orders (`MaintenanceTab.tsx`)
- **What it does:** Facility repair ticket system and expense tracking.
- **Key Features:**
  - Work order creation with priority levels (`Low`, `Medium`, `High`, `Critical`).
  - Repair cost tracking & technician assignment.
  - Automatically syncs target room status to `"Maintenance"` to prevent double-booking.

### 8. ✨ Housekeeping Operations (`HousekeepingTab.tsx`)
- **What it does:** Room cleanliness workflow and inspection management.
- **Key Features:**
  - Tracks rooms marked as `Dirty`, `Cleaning in Progress`, or `Clean`.
  - Assigns cleaning staff to specific rooms and updates room readiness in real time.

### 9. 📈 Reports & Financial Analytics (`ReportsTab.tsx`)
- **What it does:** Executive financial intelligence and performance data.
- **Key Features:**
  - Key metrics: ADR (Average Daily Rate) and RevPAR (Revenue Per Available Room).
  - Monthly financial breakdown graphs & exportable summary metrics.

### 10. 🔔 System Notifications (`NotificationsTab.tsx`)
- **What it does:** Real-time operational alert hub.
- **Key Features:**
  - High-priority system alerts (new bookings, critical maintenance tickets, cancellations).
  - Unread badge counter & 1-click "Mark all as read".

---

## 🏆 Presentation Highlights

```
                       ┌─── OverviewTab (Recharts & KPIs)
                       ├─── RoomsTab (Inventory & Pricing)
                       ├─── CalendarTab (Timeline Grid)
                       ├─── ReservationsTab (Check-In/Out)
[ Admin Dashboard ] ───┼─── GuestsTab (CRM & VIP Tracking)
                       ├─── StaffTab (RBAC Security)
                       ├─── MaintenanceTab (Work Orders & Costs)
                       ├─── HousekeepingTab (Cleaning Workflow)
                       ├─── ReportsTab (ADR & RevPAR Metrics)
                       └─── NotificationsTab (Real-time Alerts)
```

- 🚀 **Performance:** `React.lazy` code-splits every tab so heavy components load only when clicked.
- 🔐 **Security:** Protected by JWT cookie authentication & role checks (`admin`/`staff`).
- 📱 **Responsive UI:** Fully responsive drawer sidebar with dark-slate (`#090D16`) & gold (`#D4AF37`) styling.
