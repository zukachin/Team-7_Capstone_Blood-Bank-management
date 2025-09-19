# Blood-Bank-Management-System

# 🩸 Blood Bank App

A full-stack application for managing **blood donations, requests, and inventory**.  
It connects **Donors, Recipients, Admins, and Super Admins** in one platform.

---

## 🚀 Features

- **Donor Role**
  - Register, update profile & availability
  - Book donation slots
  - View donation history

- **Recipient Role**
  - Search available blood by type & location
  - Place blood requests
  - Track request status (Pending, Approved, Fulfilled)

- **Admin Role**
  - Manage requests (approve/reject)
  - Update inventory after donations
  - View dashboard & reports

- **Super Admin Role**
  - Create new Admin accounts
  - Add new blood bank centers & campaign locations

---

## 🛠️ Tech Stack

- **Frontend**: React (with Tailwind CSS, shadcn/ui components)  
- **Backend**: Node.js + Express  
- **Database**: MongoDB  
- **Authentication**: JWT (JSON Web Tokens)  
- **Other**: dotenv for environment configuration

---

## 📂 Project Structure

Blood-Bank-App/
│── backend/ # Express + Postgresql backend
│── frontend/ # React frontend
│── README.md


---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/zukachin/Team-7_Capstone_Blood-Bank-management.git
cd Blood-Bank-App

### 2️⃣ Backend Setup

Go to the backend folder:

cd backend


Install dependencies:

npm install


Create a .env file in the backend/ directory with the following:

# Backend Environment Variables

# -----------------------------
# Server Config
# -----------------------------
PORT=4000

# -----------------------------
# Database Config (Postgres)
# -----------------------------
# Format: postgres://<username>:<password>@<host>:<port>/<dbname>
PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=
PG_DATABASE=
PG_PORT=5432


JWT_SECRET=

OTP_TTL_MINUTES=10
BCRYPT_SALT_ROUNDS=10
JWT_EXPIRES_IN=7d

MAIL_USER=
MAIL_PASS=
MAIL_SERVICE=gmail

MAIL_FROM=

Run the backend server:

npm start


3️⃣ Frontend Setup

Open a new terminal and go to the frontend folder:

cd frontend


Install dependencies:

npm install


Run the frontend:

npm run dev


By default, the frontend runs at:
👉 http://localhost:5173


🔐 User Roles & Access

Donor/Recipient → Register via the app

Admin → Created by Super Admin

Super Admin → Has access to create Admins & add campaign centers

⚠️ Note: Super Admin login is currently under credential fixes. The frontend screens are ready, but login is temporarily unavailable.

🧪 Testing

Register a donor → book a donation slot → verify stock update in Admin panel

Register a recipient → place a request → approve it as Admin → check status update

Super Admin (once working) → create new Admin → new Admin logs in and continues workflow
