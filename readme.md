
SkillNexus – Creator Collaboration Platform**.

------------------------------------------------------------
📌 PROBLEM STATEMENT
In the current creator economy, people who can build websites, edit videos, design posters, develop apps, or offer creative/technical services have difficulty reaching clients directly. Similarly, clients face challenges finding trustworthy creators who match their exact needs.

There is no simple, clean platform where:
- Creators can post what they can build.
- Clients can browse creators and directly contact them.

------------------------------------------------------------
📌 PROJECT PURPOSE / GOAL
Build a platform where:
1. **Creators (Service Providers)** create a profile and post what they can build.
2. **Clients (Service Seekers)** browse creator posts.
3. Clients can directly **contact creators via chat**.
4. A clean, modern, responsive UI connects both parties smoothly.
5. Future scope includes:
   - Orders
   - Payment integration
   - Ratings & reviews
   - Portfolio system

This is a **portfolio-grade, resume-worthy project**.

------------------------------------------------------------
📌 SOLUTION (WHAT YOU WILL BUILD)
Build a **full MERN application** with:

### ⭐ FRONTEND (React)
- Built using React + Vite + Tailwind CSS + React Router
- Responsive UI (mobile-first + desktop)
- Smooth animations (Framer Motion)
- Reusable components (Cards, Modals, Forms)
- State management using Context API
- Axios for API handling
- Auth guard (Protected Routes)
- Clean modern UI with spacing, grids, layout management
- Dark/Light mode toggle

### ⭐ BACKEND (Node.js + Express)
- Modular routes and controllers
- JWT Authentication (Login / Register)
- Secure password hashing
- MongoDB models for Users, Posts, Messages
- Cloudinary integration for image uploads
- REST APIs for:
  - User Auth
  - Profile
  - Creator Posts
  - Chat Messages
- Error handling middleware
- Role-based access (Creator | Client)

### ⭐ REAL-TIME CHAT (Socket.io)
- Creator & client real-time messages
- Message history stored in MongoDB
- Typing indicators (optional)

------------------------------------------------------------
📌 FRONTEND PAGES REQUIRED
1. Home.jsx → list of creators + search/filter  
2. Login.jsx → authentication  
3. Register.jsx → choose Creator or Client  
4. CreatePost.jsx → creator uploads what they build  
5. Projects.jsx → all creator posts  
6. Profile.jsx → user profile + posts  
7. Chat.jsx → real-time chat UI  
8. Navbar.jsx, Footer.jsx, Modals, Cards  
9. Responsive layout for mobile + desktop  

------------------------------------------------------------
📌 BACKEND MODULES REQUIRED
### 1. Models
- User
- Post
- Message

### 2. Routes
- /api/auth
- /api/users
- /api/posts
- /api/messages

### 3. Controllers
- AuthController
- UserController
- PostController
- ChatController

### 4. Middlewares
- authMiddleware
- errorHandler

### 5. Config
- db.js (MongoDB connection)
- cloudinary.js

### 6. Utils
- generateToken.js
- uploadCloudinary.js

------------------------------------------------------------
📌 COMPLETE FOLDER STRUCTURE

SkillNexus/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── client/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── utils/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json

------------------------------------------------------------
📌 KEY FEATURES REQUIRED
- Creator profile & portfolio
- Post creation (title, skills, description, sample image)
- Client browsing & filtering
- Direct chat between client & creator (Socket.io)
- Authentication with JWT
- Secure backend architecture
- Modern responsive UI
- Clean code, comments, modular structure

------------------------------------------------------------
📌 EXPECTED OUTPUT
Generate:

1. **Complete MERN folder structure**
2. **Complete backend code**  
   - Routes  
   - Controllers  
   - Models  
   - Middlewares  
   - Config  
   - Utils  
   - server.js  
3. **Complete frontend code**  
   - Pages  
   - Components  
   - Context  
   - Routing  
   - Tailwind setup  
4. **Dummy data** where backend is not directly connected  
5. **API service file (axios instance)**  
6. **Instructions to run frontend + backend**  
7. **Everything should be copy–paste ready**  

