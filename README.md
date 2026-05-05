# 🚀 TaskManager
[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://task-manager-2-sigma.vercel.app/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

A premium, full-stack task management platform built with a high-end **Indigo Glassmorphism** aesthetic. Engineered for enterprise-level task orchestration, secure team collaboration, and seamless cloud deployment.

## 🔗 Live Demo
**Production URL**: [https://task-manager-2-sigma.vercel.app/](https://task-manager-2-sigma.vercel.app/)

---

## 📸 Product Showreel

### Main Dashboard
![Dashboard Screenshot](screenshots/dashboard.png)

### Authentication Flow
| Login Experience | Signup Experience |
| :---: | :---: |
| ![Login](screenshots/login.png) | ![Signup](screenshots/signup.png) |

---

## ✨ Premium Features

- **💎 Elite UI/UX**: Stunning glassmorphism interface using vibrant gradients, backdrop blurs, and smooth micro-animations.
- **📊 Advanced Analytics**: Real-time dashboard featuring **interactive Pie Charts** for task distribution and dynamic productivity stats.
- **🔍 Smart Search & Filter**: Instant search by task title and advanced filtering by priority (High/Medium/Low).
- **🔐 Enterprise Security**: Robust **JWT-based authentication** with role-based access control (Admin/Member).
- **☁️ Cloud Persistence**: Integrated with **MongoDB Atlas** for high-availability, persistent data storage.
- **⚡ Performance Optimized**: Lightning-fast response times powered by **FastAPI** and **Vite + React**.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Hooks, Context API)
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Custom Glassmorphism Design System)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB Atlas (Async Motor Driver)
- **Auth**: PyJWT, Passlib (Bcrypt)
- **Deployment**: Vercel Serverless Functions

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- MongoDB Atlas Account

### 1. Clone & Setup
```bash
git clone https://github.com/himanshu-662/Task-Manager-2.git
cd Task-Manager-2
```

### 2. Backend Configuration
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend` folder:
```env
MONGO_URL=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_key
PORT=5001
```

### 3. Frontend Configuration
```bash
cd ../frontend
npm install
npm run dev
```

## 🌐 Production Deployment (Vercel)

The project is pre-configured for a unified full-stack deployment on Vercel.

1. **Push to GitHub**: Connect your repository to Vercel.
2. **Environment Variables**: Add the following in Vercel Settings:
   - `MONGO_URL`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure random string for tokens.
3. **Deployment**: Vercel will automatically detect the `vercel.json` and build both the frontend and the FastAPI serverless functions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with precision by [Himanshu](https://github.com/himanshu-662)
