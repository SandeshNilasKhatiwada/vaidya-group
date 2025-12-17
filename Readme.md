### Initilization of the project

- add .env file in the root
- see the example of env file in .env.test

### Running the Project

- npm i
- npm run dev (for localmachine devlopment)
- npm start (for production)

### To create a default username you have to run the seed

- npm run seed
  This will create a ( email: "admin@example.com", password:"Admin@123")

### To create a migrations

# 1. Generate Prisma Client

- npx prisma generate

# 2. Run database migrations

- npx prisma migrate dev --name init

# 3. Verify database tables were created

- npx prisma db pull
