# 🛠️ Dev-Tinder (Backend API)

**Dev-Tinder** is a robust, scalable RESTful API built to power the social networking platform for developers. It manages user authentication, matching algorithms, real-time chat, and premium subscription payments.

This repository contains the **Node.js & Express.js** server-side logic, integrated with **MongoDB**, **Socket.io**, and **Generative AI**.

🔗 **Live API:** [Insert Your Render/AWS Link Here]  
🔗 **Frontend Repo:** [Link to Frontend Repo]

---

## ⚙️ Tech Stack

### Core Runtime & Framework
* **Node.js**: Asynchronous, event-driven JavaScript runtime.
* **Express.js**: Fast, unopinionated web framework for routing and middleware.

### Database & Storage
* **MongoDB**: NoSQL database for flexible schema design.
* **Mongoose**: ODM library for schema validation and business logic hooks.
* **Indexing**: Optimized query performance using compound indexes on status, location, and skills.

### Real-Time & AI
* **Socket.io**: Enabling bi-directional communication for instant messaging and online presence.
* **Google Gemini API**: Integrated LLM for generating personalized career advice and bio reviews.

### Security & Authentication
* **JWT (JSON Web Tokens)**: Stateless authentication via secure, HttpOnly cookies.
* **Bcrypt**: Password hashing for security.
* **CORS**: Dynamic origin configuration to support multi-environment deployments (Vercel/Localhost).
* **Validator.js**: Strict input validation for user data.

### Payments
* **Razorpay**: Payment gateway integration for order creation and verification (Silver/Gold Tiers).

---

## 🚀 Key Features

### 🔐 Secure Authentication System
* **HttpOnly Cookies**: Prevents XSS attacks by storing tokens securely in the browser.
* **Role-Based Access Control**: Middleware (`userAuth`) ensures protected routes are accessible only to valid users.
* **Password Encryption**: Industry-standard hashing using bcrypt.

### 📡 Real-Time WebSocket Architecture
* **Instant Chat**: One-on-one messaging with delivery status.
* **Live Online/Offline Status**: Real-time user presence tracking.
* **Dynamic Unread Counts**: Push updates for message notifications.

### 🧠 AI-Powered "Career Coach"
* **Gemini Integration**: A dedicated route (`/gemini`) that accepts user prompts and returns context-aware career guidance, code reviews, and profile optimization tips.

### 💳 Premium Membership & Monetization
* **Razorpay Webhooks**: Verifies payment signatures for secure transaction handling.
* **Tiered Access**: Logic to gate specific API endpoints (e.g., specific search filters) based on membership status (`isPremium`).

### 🔎 Advanced Search & Feed
* **Pagination**: Efficient data retrieval using `skip` and `limit`.
* **Regex Search**: Case-insensitive text search across multiple fields (Name, Skills) with exclusion logic (hiding blocked/connected users).
* **Connection Logic**: Complex state management for `Interested`, `Ignored`, `Accepted`, and `Rejected` request statuses.

---
