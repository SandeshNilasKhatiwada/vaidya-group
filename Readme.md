# Vaidya - Car Management API

A Node.js/Express-based REST API for managing car data with user authentication and CSV import functionality. Built with Prisma ORM for database management and Zod for data validation.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Car Management**: Full CRUD operations for car inventory
- **CSV Import**: Batch import cars from CSV files
- **Data Validation**: Zod schema validation for all endpoints
- **Database Migration**: Prisma-managed database schema with migrations
- **Logging**: Request logging for CSV imports

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MySQL** (v5.7 or higher)

---

## Project Setup

### Step 1: Clone and Install Dependencies

```bash
cd /Users/sandeshnilaskhatiwada/Desktop/vaidya
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/vaidya"

# JWT Configuration (optional, if using custom secret)
JWT_SECRET=your_jwt_secret_key
```

**Note**: If you have an `.env.test` file, use it as a reference for the required variables.

### Step 3: Set Up the Database

Ensure MySQL is running and create the database:

```bash
mysql -u root -p -e "CREATE DATABASE vaidya;"
```

---

## Database Setup

### Initialize Prisma Migrations

Prisma has two migration files already created. Run the migrations to set up your database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Run all pending migrations
npx prisma migrate deploy

# Or, for development environment (creates shadow database):
npx prisma migrate dev
```

### Create Default Admin User

Seed the database with a default admin account:

```bash
npm run seed
```

This will create:

- **Email**: `admin@example.com`
- **Password**: `Admin@123`

### Verify Database Setup

To view and manage your database tables in a visual UI:

```bash
npx prisma studio
```

---

## Running the Application

### Development Mode (with Auto-reload)

```bash
npm run dev
```

The server will start on `http://localhost:3000` and automatically reload when files change.

### Production Mode

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

---

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
authorization: Bearer <your_jwt_token>
```

---

### User Endpoints

#### Login

```http
POST /api/user/login
Content-Type: application/json

{
  "username": "admin@example.com",
  "password": "Admin@123"
}
```

**Response** (Success):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Login successful"
}
```

---

### Car Endpoints

#### Create Car

```http
POST /api/car
Authorization: Bearer <token>
Content-Type: application/json

{
  "make_name": "Toyota",
  "model_name": "Camry",
  "trim_name": "LE",
  "trim_description": "Standard trim",
  "engine_type": "V4",
  "engine_fuel_type": "Gasoline",
  "engine_cylinders": 4,
  "engine_size": 2.5,
  "engine_horsepower_hp": 203,
  "engine_horsepower_rpm": 6000,
  "engine_drive_type": "FWD",
  "body_type": "Sedan",
  "body_doors": 4,
  "body_seats": 5
}
```

#### Get All Cars

```http
GET /api/car/all?page=1&limit=10
Content-Type: application/json
```

#### Get Car by ID

```http
GET /api/car/:id
Content-Type: application/json
```

#### Update Car

```http
PUT /api/car/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "make_name": "Honda",
  "model_name": "Accord"
  // ... other fields to update
}
```

#### Delete Car

```http
DELETE /api/car/:id
Authorization: Bearer <token>
```

---

### CSV Import Endpoint

#### Import Cars from CSV

```http
POST /api/csv/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

[Upload CSV file]
```

**CSV Format** (expected columns):

```
make_name,model_name,trim_name,engine_type,engine_fuel_type,body_type,body_doors,body_seats
Toyota,Camry,LE,V4,Gasoline,Sedan,4,5
Honda,Accord,EX,V4,Gasoline,Sedan,4,5
```

---

## Project Structure

```
vaidya/
├── index.js                      # Main application entry point
├── package.json                  # Project dependencies and scripts
├── .env                          # Environment variables (create this)
├── Readme.md                     # Project documentation
│
├── controllers/
│   ├── user.controller.js        # User authentication logic
│   ├── car.controller.js         # Car CRUD operations
│   └── carImport.controller.js   # CSV import logic
│
├── routes/
│   ├── index.route.js            # Main router (combines all routes)
│   ├── user.route.js             # User authentication routes
│   ├── car.route.js              # Car management routes
│   └── csvImport.route.js        # CSV import routes
│
├── middlewares/
│   ├── auth.middleware.js        # JWT authentication middleware
│   ├── validation.middleware.js  # Zod schema validation middleware
│   └── multer.middleware.js      # File upload middleware
│
├── validation/
│   └── car.validition.js         # Zod schemas for car validation
│
├── utils/
│   └── jwt.js                    # JWT token generation/verification
│
├── prisma/
│   ├── schema.prisma             # Prisma database schema
│   ├── seed.js                   # Database seeding script
│   └── migrations/               # Database migration files
│       ├── 20251217042930_init_user_auth/
│       └── 20251217052949_car_modules_added/
│
├── data/
│   └── CarsData-Backend.csv      # Sample car data (for import testing)
│
├── logs/
│   └── upload-log-*.txt          # CSV import logs
│
└── temp/
    └── upload-*.csv              # Temporary uploaded CSV files
```

---

## Troubleshooting

### Database Connection Error

- Verify MySQL is running: `mysql -u root -p`
- Check `DATABASE_URL` in `.env` matches your MySQL configuration
- Ensure the database `vaidya` exists

### JWT Authentication Failed

- Ensure token is included in the `Authorization` header
- Check token format: `Bearer <token>` (with space)
- Verify `JWT_SECRET` is correctly set in `.env`

### Migration Issues

If you encounter migration conflicts:

```bash
# Reset database (development only - DELETES ALL DATA)
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Run all migrations
# 4. Seed the database
```

### Port Already in Use

If port 3000 is already in use, change it in `.env`:

```env
PORT=3001
```

---

## Common Commands Reference

| Command                     | Description                                |
| --------------------------- | ------------------------------------------ |
| `npm install`               | Install dependencies                       |
| `npm run dev`               | Start development server with auto-reload  |
| `npm start`                 | Start production server                    |
| `npm run seed`              | Seed database with default admin user      |
| `npx prisma studio`         | Open Prisma Studio for database management |
| `npx prisma migrate dev`    | Create and run migrations (dev)            |
| `npx prisma migrate deploy` | Run pending migrations (production)        |
| `npx prisma db pull`        | Pull current database schema               |
| `npx prisma generate`       | Generate Prisma Client                     |

---

## Notes

- JWT tokens are used for authentication on protected endpoints
- Password hashing is handled by bcrypt
- All input is validated using Zod schemas
- CSV imports are logged to `logs/upload-log-*.txt`
- The seed user credentials are: `admin@example.com` / `Admin@123`

---

For further assistance, check the individual controller files in the `controllers/` directory for detailed implementation logic.
