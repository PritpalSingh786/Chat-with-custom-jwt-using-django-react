Bhai 👍
main tumhare **Django + React custom JWT chat app** ke liye ek **clean, professional aur interview-ready README.md** likh raha hoon.
Tum direct copy-paste kar sakte ho 👇

---

# 💬 Chat Application with Custom JWT (Django + React)

A full-stack real-time chat application built using **Django (Backend)** and **React (Frontend)** with a **custom JWT authentication system**.
The project follows clean architecture and is designed for learning as well as production-ready understanding.

---

## 🚀 Features

* 🔐 Custom JWT Authentication (Login / Register / Logout)
* 👤 Custom Django User Model
* 💬 Real-time Chat using WebSockets (Django Channels)
* 🔄 Multiple users chatting simultaneously
* 🗂️ Clean project structure (separate apps for auth, chat, sockets)
* ⚛️ React frontend with API integration
* 🌐 REST APIs using Django REST Framework
* 🔒 Secure environment variables using `.env`
* 📦 SQLite for development (easily replaceable with PostgreSQL / MySQL)

---

## 🛠️ Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* Django Channels (WebSockets)
* Custom JWT (no third-party auth like SimpleJWT)
* SQLite (development)

### Frontend

* React
* JavaScript
* Axios
* CSS

---

## 📁 Project Structure

```
django_server/
│
├── chat/              # Chat logic & models
├── common/            # Shared utilities
├── jwtauth/           # Custom JWT authentication
├── post/              # Post related APIs (if used)
├── sockets/           # WebSocket / Channels logic
├── django_server/     # Main Django project
│
├── react_client/      # React frontend
│
├── .env               # Environment variables (ignored)
├── .env.example       # Sample env file
├── db.sqlite3
├── manage.py
├── requirements.txt
└── .gitignore
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
SECRET_KEY=your_secret_key
DEBUG=True
```

(Refer `.env.example` for guidance)

---

## ⚙️ Backend Setup (Django)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django server
python manage.py runserver
```

---

## ⚛️ Frontend Setup (React)

```bash
cd react_client
npm install
npm start
```

---

## 🔄 Authentication Flow (Custom JWT)

1. User registers → JWT generated
2. JWT stored on frontend
3. JWT sent in headers for protected APIs
4. Backend validates JWT manually
5. WebSocket connections are authenticated using user identity

---

## 💡 Why Custom JWT?

* Deep understanding of authentication flow
* No black-box dependency
* Better interview explanation
* Full control over token lifecycle

---

## 📌 Best Practices Used

* `.env` ignored from Git
* `.env.example` provided
* Modular Django apps
* Separation of frontend & backend
* Secure token handling
* Clean and readable codebase

---

## 🧪 Future Improvements

* Refresh token mechanism
* Message persistence & pagination
* Online / offline user status
* Deployment with Docker
* PostgreSQL support

---

## 👨‍💻 Author

**Pritpal Singh**
Backend Developer (Django | Node.js | REST | WebSockets)

🔗 GitHub: [PritpalSingh786](https://github.com/PritpalSingh786)

---

## ⭐ If you like this project

Give it a **star ⭐** — it motivates me to build more!

---
