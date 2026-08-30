# Org Portfolio 3D - 3D Portfolio Website with Admin CMS

A comprehensive 3D portfolio website built with React, Three.js, and Node.js featuring an interactive 3D experience, admin CMS, and order management system.

## Features

### 🎨 Frontend (React + Three.js)
- **Immersive 3D Hero Scene** - Interactive particle field, floating shapes, and animated grid
- **Portfolio Gallery** - Filterable, searchable project showcase with 3D project cards
- **Project Detail Pages** - Rich project views with 3D scenes, galleries, and case studies
- **Order System** - Multi-step order wizard with project type selection, pricing tiers, and contact forms
- **Admin Dashboard** - Complete CMS for managing projects, orders, users, and settings
- **Authentication** - JWT-based auth with login/register/password management
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Dark Mode** - Full dark mode support with persistence

### 🛠 Backend (Node.js + Express + SQLite)
- **RESTful API** - Clean API endpoints for all features
- **JWT Authentication** - Secure token-based auth with role-based access control
- **Database** - SQLite with better-sqlite3 for zero-config deployment
- **Admin CMS** - Project CRUD, order management, user management, settings
- **Order Processing** - Multi-step order flow with status tracking

### 📦 Tech Stack
- **Frontend**: React 18, Vite, React Router, Three.js, React Three Fiber, Drei, Framer Motion, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, SQLite, JWT, bcryptjs
- **Development**: ESLint, Prettier, Concurrently

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone and navigate to project
cd org-portfolio-3d

# Install all dependencies
npm run install:all

# Start development servers (client + server)
npm run dev
```

### Environment Variables

Create `.env` files in both `client` and `server` directories:

**server/.env**
```env
PORT=4000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

**client/.env**
```env
VITE_API_URL=http://localhost:4000/api
```

### Default Admin Account
- **Email**: admin@orgportfolio.com
- **Password**: admin123

## Project Structure

```
org-portfolio-3d/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── admin/      # Admin layout components
│   │   │   ├── three/      # Three.js 3D components
│   │   │   └── ...
│   │   ├── contexts/       # React contexts (Auth, Portfolio)
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── auth/       # Auth pages
│   │   │   └── ...
│   │   ├── services/       # API services
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── portfolio.js
│   │   ├── orders.js
│   │   └── admin.js
│   ├── middleware/         # Express middleware
│   │   └── auth.js
│   ├── database.js         # SQLite database setup
│   ├── server.js           # Express app entry
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## Available Scripts

```bash
# Root level
npm run dev                 # Start both client and server
npm run build              # Build both client and server
npm run start              # Start production server
npm run install:all        # Install all dependencies

# Client
npm run dev --workspace=client      # Start Vite dev server
npm run build --workspace=client    # Build for production (auto-installs deps via npm ci)
npm run preview --workspace=client  # Preview production build

# Server
npm run dev --workspace=server      # Start with nodemon
npm run start --workspace=server    # Start production server
npm run db:init --workspace=server  # Reinitialize database
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Portfolio
- `GET /api/portfolio` - List projects (with pagination, search, filter)
- `GET /api/portfolio/:id` - Get single project
- `GET /api/portfolio/categories/all` - Get all categories
- `POST /api/portfolio` - Create project (admin)
- `PUT /api/portfolio/:id` - Update project (admin)
- `DELETE /api/portfolio/:id` - Delete project (admin)
- `POST /api/portfolio/categories` - Create category (admin)
- `PUT /api/portfolio/categories/:id` - Update category (admin)
- `DELETE /api/portfolio/categories/:id` - Delete category (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (admin)
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status (admin)
- `PUT /api/orders/:id` - Update order (admin)
- `DELETE /api/orders/:id` - Delete order (admin)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker (Optional)
```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN cd client && npm ci && npm run build
EXPOSE 4000
CMD ["npm", "run", "start"]
```

## License

MIT License - see LICENSE file for details