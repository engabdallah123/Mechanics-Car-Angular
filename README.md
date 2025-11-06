
# 🚗 Mechanics Car Maintenance

A **Car Maintenance Management System** built with **Angular**, designed for workshop environments where **only managers and workers** can log in and manage daily car maintenance operations.

---

## 📖 Project Overview

This system simulates a **real-world car service workshop**.  
It allows the manager or employees to:
- Register clients and their vehicles.
- Schedule maintenance orders in specific time slots.
- Assign workers to perform services.
- Track order progress and generate invoices upon completion.

---

## ⚙️ Key Features

### 👥 Client & Vehicle Management
- Add and manage client information.
- Register and link multiple cars per client.
- View the client’s full maintenance history.

### 🧰 Services Management
- Add, update, or delete services provided by the workshop.
- Define service prices and duration.

### 🗓️ Daily Scheduling System
- The system includes **4 service stations**.
- Each station has **specific time slots** between **8:00 AM and 11:00 AM**.
- Slots are divided into fixed time intervals.
- Users can only create orders in **available and future** time slots (past times are disabled).
- Each order must be linked to a station and a specific slot.

### 📋 Order Management
- Create maintenance orders by selecting:
  - Client and car.
  - Service station and slot.
  - Worker and requested service.
- Workers can update the order status to **“Completed”** when done.
- Once completed, the system allows the manager to **generate an invoice** for the client.

### 🧑‍🔧 Worker Management
- Display all available workers.
- Assign workers to specific jobs.
- Track worker performance and workload.

### 💵 Invoice Management
- Automatically generate invoices after service completion.
- Include details like service type, worker, date, and total cost.

---

## 🧩 Tech Stack

| Category | Technology |
|-----------|-------------|
| Frontend | Angular |
| Backend | ASP.NET Core Web API *(or any REST API)* |
| Database | SQL Server |
| Authentication | JWT (JSON Web Token) |
| UI | HTML, SCSS, TypeScript |
| Tools | Visual Studio Code / Visual Studio + GitHub |

---

## 🧠 Business Workflow

1. Manager or worker logs in.
2. The system displays available stations and time slots.
3. A new order is created by selecting the station, slot, and service.
4. The assigned worker performs the job and marks it as completed.
5. The system automatically generates a printable invoice.

---

## 📅 Example Daily Schedule

| Station | Time Slot | Status |
|----------|------------|--------|
| Station 1 | 8:00 - 8:30 | ✅ Booked |
| Station 1 | 8:30 - 9:00 | ✅ Available |
| Station 2 | 9:30 - 10:00 | ❌ Expired |
| Station 3 | 10:30 - 11:00 | ✅ Available |

---

## 🚀 Future Enhancements

- Add a **notification system** for order updates.
- Add a **dashboard** with analytics for daily and monthly statistics.
- Implement **role-based access control** (Manager / Worker / Receptionist).
- Add **multi-language support** (English / Arabic).
- Extend the project with a **Customer Portal** for clients to view their order history.

---

## 🧑‍💻 Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/username/mechanics-car-maintenance.git
   ```
## 🎥 Video Presentation
Check out the video presentation of this project on LinkedIn:
[My Video]()

---

## 🌟 Final Words

Mechanics Car Maintenance isn’t just a coding project — it’s a **real-world simulation** of how workshops manage time, workers, and clients efficiently.  
It reflects the power of combining **Angular** and **.NET** to build practical, organized, and scalable systems.

Every line of code in this project was written with the goal of making maintenance management smarter and more efficient 🔧💡

> “Great systems start with small ideas — and grow through passion and precision.”

Thank you for checking out this project 🙏  
If you like it, don’t forget to ⭐ the repository and share your feedback!

**— Developed with ❤️ by Abdallah Ebrahim**


