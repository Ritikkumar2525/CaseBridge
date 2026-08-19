<div align="center">
  <h1>CaseBridge</h1>
  <p>A modern, multi-tenant complaint management platform equipped with real-time updates and secure communications.</p>

  <p>
    <a href="https://casebridge-eight.vercel.app"><strong>View Live Demo</strong></a> · 
    <a href="https://github.com/Ritikkumar2525/CaseBridge"><strong>Repository</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

## 📖 Overview

**CaseBridge** is a comprehensive multi-tenant platform designed to streamline and manage complaints securely. Built with modern web technologies, it allows organizations to seamlessly handle user and staff registrations, route complaints intelligently to specific organizations, and collaborate in real-time.

## ✨ Key Features

- 🏢 **Multi-Tenant Architecture**: Supports multiple organizations within a single deployment.
- 🔒 **Secure Authentication**: Stateless authentication utilizing JSON Web Tokens (JWT).
- 🧑‍💻 **Role-Based Access**: Dedicated roles for Users, Staff, and Organization Admins ensuring strict data access controls.
- ⚡ **Real-Time Communication**: Integrated with **Laravel Reverb (WebSockets)** for instant updates.
- 📹 **Video Conferencing**: Seamlessly integrated **Jitsi** for live video interactions.
- 📁 **Targeted Complaint Routing**: Complaints are strictly scoped and mapped to the respective organization to prevent fake claims.

## 🚀 Tech Stack

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **API Client**: Axios

### Backend
- **Framework**: Laravel
- **Database**: MongoDB
- **Authentication**: JWT Auth
- **Broadcasting**: Laravel Reverb

## 🛠️ Local Setup

Follow these instructions to run the project locally.

### Prerequisites
- Node.js
- PHP (v8.2+)
- Composer
- MongoDB

### 1. Clone the repository
```bash
git clone https://github.com/Ritikkumar2525/CaseBridge.git
cd CaseBridge
```

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```
Configure your `.env` with your MongoDB credentials:
```env
DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=casebridge
```
Run the local server and websocket server:
```bash
php artisan serve
php artisan reverb:start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

## 🔗 Links
- **Live Platform**: [https://casebridge-eight.vercel.app](https://casebridge-eight.vercel.app)
