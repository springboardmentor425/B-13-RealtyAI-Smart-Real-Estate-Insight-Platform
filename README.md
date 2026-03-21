# 🏠 RealtyAI - Smart Real Estate Insight Platform

RealtyAI is a premium, full-stack AI platform designed to provide accurate property price predictions for Bangalore real estate. It combines a high-performance Machine Learning model with a secure Node.js authentication system and a stunning, responsive Glassmorphism UI.

## 🚀 Key Features

- **🧠 AI Price Prediction:** Uses a Linear Regression model trained on 13,000+ records to predict home prices based on location, square footage, and size (BHK).
- **🔐 Secure Authentication:** Full-featured JWT-based auth system with HTTP-only cookies, refresh tokens, and password reset capability.
- **🎨 Premium UI/UX:** Stunning Glassmorphism design with GSAP animations, AOS scroll effects, and custom toast notifications.
- **📱 Fully Responsive:** Optimized for all devices, from desktops to mobile phones.
- **⚡ One-Command Setup:** Start both the backend and frontend servers with a single command.

## 📁 Project Structure

```text
RealtyAI/
├── BHP/
│   ├── Auth/          # Node.js Authentication Server (Express, MongoDB, JWT)
│   ├── client/        # Frontend (HTML, CSS, GSAP, Bootstrap 5)
│   ├── server/        # Flask Backend (ML Logic & API)
│   └── model/         # Saved ML Model & Artifacts
├── package.json       # Root package for concurrent execution
└── README.md          # Project Documentation
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.x
- MongoDB (Connection string required in Auth `.env`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ayush-Raghuwanshi-Dev/RealtyAI.git
   cd RealtyAI
   ```

2. **Install Root Dependencies:**
   ```bash
   npm install
   ```

3. **Install Auth Backend Dependencies:**
   ```bash
   cd BHP/Auth
   npm install
   ```

4. **Install Python Dependencies:**
   ```bash
   pip install flask flask-cors pandas scikit-learn
   ```

## ▶️ Running the Project

From the **ROOT** folder, run:

```bash
npm run dev
```

This will concurrently start:
1. **Node.js Auth Server** on `http://localhost:3000`
2. **Flask Prediction Server** on `http://localhost:5000`

Access the application at: **[http://localhost:5000](http://localhost:5000)**

## 🔮 Future Scope
- **Advanced ML Models:** Integrating XGBoost and Random Forest for higher accuracy.
- **User Dashboard:** Allowing users to save and track their property observations.
- **Interactive Maps:** Visualizing property value heatmaps across Bangalore.
- **OAuth Integration:** Adding Google and GitHub login options.

---
Developed by **Ayush Raghuwanshi** | Springboard AI Project
