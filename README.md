# Archer Health
![Archer Health banner](https://health.adarcher.app/banner.webp)

**Part of the Archer Life Suite** — A comprehensive health and wellness platform for calorie tracking, meal logging, and nutrition management.

Archer Health is a modern web application built with Next.js 15, offering nutrition tracking with over 10,000 foods, goal setting, progress analytics, and recipe discovery. It integrates verified USDA FoodData Central nutrition information for accurate calorie and nutrient calculations and TheMealDb for recipes.

## Quick Start (Production)

### 1. Clone the Repository
```bash
git clone https://github.com/AD-Archer/archer-health.git
cd archer-health
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration (see Environment Setup section below)
```

### 3. Deploy with Docker Compose
```bash
# Start the application with database
docker-compose up -d

# Or use the pre-built Docker image from Docker Hub
docker run -d \
  --name archer-health \
  -p 3000:3000 \
  --env-file .env \
  adarcher/archer-health:latest
```

### 4. Access Your Application
- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## Environment Setup

Create a `.env` file with the following required variables:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_secure_password@db:5432/archer_health_db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key"
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"

# Email/SMTP Configuration (for contact forms)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
CONTACT_EMAIL="admin@yourdomain.com"
```

### Database Setup
The application uses PostgreSQL. You can run it via Docker Compose or connect to an existing PostgreSQL instance.

### Clerk Authentication Setup
1. Create a [Clerk](https://clerk.com) account
2. Create a new application
3. Copy the publishable key and secret key to your `.env` file
4. Configure your OAuth providers and redirect URLs

### Email Configuration
The contact form requires SMTP configuration. For Gmail:
1. Enable 2-factor authentication
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Use your Gmail address as `SMTP_USER`
4. Use the App Password as `SMTP_PASS`

## Docker Deployment Options

### Option 1: Docker Compose (Recommended)
```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: archer_health_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  archer-health:
    image: adarcher/archer-health:latest
    container_name: archer-health
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

volumes:
  postgres_data:
```

### Option 2: Standalone Docker
```bash
# Pull the latest image
docker pull adarcher/archer-health:latest

# Run with environment variables
docker run -d \
  --name archer-health \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..." \
  -e CLERK_SECRET_KEY="sk_test_..." \
  adarcher/archer-health:latest
```

### Option 3: Build from Source
```bash
# Clone and build
git clone https://github.com/AD-Archer/archer-health.git
cd archer-health

# Build the image
docker build -t archer-health .

# Run the container
docker run -d \
  --name archer-health \
  -p 3000:3000 \
  --env-file .env \
  archer-health
```

## USDA Nutrition Data

Archer Health integrates verified USDA FoodData Central nutrition information for accurate calorie and nutrient calculations.

### What's Included
- **2+ million foods** with verified nutritional information
- Complete nutrient profiles (proteins, carbs, fats, vitamins, minerals)
- Food categories and serving size data
- All data sourced from USDA's official FoodData Central database

### Data Sources
- Current dataset: `data/FoodData_Central_csv_2025-04-24/`
- Includes: food.csv, nutrient.csv, food_nutrient.csv, food_portion.csv, etc.
- Data is updated annually with new USDA releases

### Database Architecture
The database includes two main data categories:
1. **User Data**: Custom foods, meals, goals, achievements (user-generated)
2. **USDA Data**: Verified nutritional information (pre-seeded)

Tables are designed to be modular - USDA data can be updated independently of user data.

### Updating USDA Data
When new USDA data is released:
```bash
# 1. Download new CSV files from USDA FoodData Central
# 2. Replace contents of data/FoodData_Central_csv_2025-04-24/
# 3. Update folder name in seed script if needed
# 4. Re-run seeding
npx prisma db seed
```

**Note**: Seeding is non-destructive and idempotent - user data remains untouched.

## Development Setup

For local development with full source code access:

```bash
# Clone the repository
git clone https://github.com/AD-Archer/archer-health.git
cd archer-health

# Install dependencies
pnpm install

# Start PostgreSQL database
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Seed USDA data (optional, takes several minutes)
npx prisma db seed

# Start the development server
pnpm dev
```

## API Endpoints

- **Health Check**: `GET /api/health` - Application health status
- **Authentication**: Clerk-managed authentication endpoints
- **Nutrition Data**: USDA FoodData Central integration
- **User Management**: Profile, goals, and progress tracking

## Features

- ✅ **Nutrition Tracking**: Calorie counting with USDA-verified data
- ✅ **Meal Logging**: Comprehensive meal and food entry system
- ✅ **Goal Setting**: Personalized nutrition and fitness goals
- ✅ **Progress Analytics**: Charts and insights for tracking progress
- ✅ **Recipe Discovery**: Recipe database with nutritional information
- ✅ **User Authentication**: Secure authentication via Clerk
- ✅ **Responsive Design**: Mobile-first design for all devices
- ✅ **Health Checks**: Built-in monitoring and health checks

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **Deployment**: Docker, Docker Compose
- **Email**: SMTP integration for contact forms

## Support

- **Repository**: https://github.com/AD-Archer/archer-health
- **Docker Image**: https://hub.docker.com/repository/docker/adarcher/archer-health
- **Issues**: https://github.com/AD-Archer/archer-health/issues

## License

This project is part of the Archer Life Suite. See LICENSE file for details.

## Database Setup

Archer Health uses PostgreSQL with Prisma ORM. The database stores both user-generated food data and verified USDA FoodData Central nutrition information.

### Local Development Database

For local development, use Docker Compose:

```bash
# Start PostgreSQL database
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Seed with USDA FoodData (optional, includes 2M+ verified foods)
npx prisma db seed
```

### USDA FoodData Seeding

The application integrates USDA FoodData Central for verified nutrition data.

#### Seeded Data Includes

- **2+ million foods** with verified nutritional information
- Complete nutrient profiles (proteins, carbs, fats, vitamins, minerals)
- Food categories and serving size data
- All data sourced from USDA's official FoodData Central database

#### Data Sources

- `data/FoodData_Central_csv_2025-04-24/` — Current USDA dataset
- Includes: food.csv, nutrient.csv, food_nutrient.csv, food_portion.csv, etc.
- Data is updated annually with new USDA releases

#### Updating USDA Data

When new USDA data is released:

```bash
# 1. Download new CSV files from USDA
# 2. Replace contents of data/FoodData_Central_csv_2025-04-24/
# 3. Update folder name and seed script DATA_DIR if needed
# 4. Re-run seeding
npx prisma db seed
```

Seeding is:

- **Non-destructive**: User foods remain untouched
- **Idempotent**: Safe to run multiple times
- **Incremental**: New data can be added without conflicts

### Docker Deployment with Database Seeding

For production Docker deployments, clone the repository and run seeding locally before deployment.

#### Using Docker Compose (Recommended)

```yaml
version: '3.8'
services:
    db:
        image: postgres:15-alpine
        environment:
            POSTGRES_DB: archer_health_db
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: your_secure_password
        volumes:
            - postgres_data:/var/lib/postgresql/data

    app:
        build: .
        ports:
            - "3000:3000"
        environment:
            - DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/archer_health_db
        depends_on:
            - db
        command: sh -c "npx prisma migrate deploy && npx prisma db seed && npm start"

volumes:
    postgres_data:
```

#### Standalone Docker Build

```bash
git
# 4. Re-run seeding
npx prisma db seed
```

The seeding process is designed to be:
- **Non-destructive**: User foods remain untouched
- **Idempotent**: Can be run multiple times safely
- **Incremental**: New data can be added without conflicts

### Docker Deployment with Database Seeding

For production Docker deployments, clone the repository and run seeding locally before deployment:

#### Using Docker Compose (Recommended)

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: archer_health_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/archer_health_db
    depends_on:
      - db
    command: sh -c "npx prisma migrate deploy && npx prisma db seed && npm start"

volumes:
  postgres_data:
```

#### Standalone Docker Build

```bash
# Clone the repository
git clone https://github.com/ad-archer/archer-health.git
cd archer-health

# Build the application with embedded USDA data
docker build -t archer-health .

# Run with automatic seeding
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  archer-health
```

### Database Schema

The database includes two main data categories:

1. **User Data**: Custom foods, meals, goals, achievements (user-generated)
2. **USDA Data**: Verified nutritional information (seeded from CSV)

Tables are designed to be modular - USDA data can be updated independently of user data.

### Quick Start Commands

#### Development
```bash
# Clone the repository
git clone https://github.com/yourusername/archer-health.git
cd archer-health

# Install dependencies
pnpm install

# Start PostgreSQL database
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Seed USDA data (takes several minutes)
npx prisma db seed

# Start the application
pnpm dev

# View logs
docker-compose logs -f
```

#### Production
```bash
# Clone and set up
git clone https://github.com/yourusername/archer-health.git
cd archer-health

# Set up database and seed data locally
docker-compose up -d
npx prisma migrate deploy
npx prisma db seed

# Deploy application
docker-compose -f docker-compose.yml up --build -d app
```

### Production Deployment

Archer Health is designed for seamless deployment where users clone the repository and run seeding locally. This ensures the latest USDA data is always available and provides maximum flexibility for deployments.

#### Docker Compose Deployment

Create a `docker-compose.yml` file in your cloned repository:

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: archer_health_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/archer_health_db
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - CONTACT_EMAIL=${CONTACT_EMAIL}
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
```

**.env file:**
```bash
# Database
DB_PASSWORD=your_secure_postgres_password

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Email/SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
CONTACT_EMAIL=admin@yourdomain.com
```

#### Deployment Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/archer-health.git
   cd archer-health
   ```

2. **Set up Database and Seed Data**:
   ```bash
   # Start PostgreSQL (using Docker or your preferred method)
   docker-compose up -d

   # Run migrations
   npx prisma migrate deploy

   # Seed USDA nutrition data (this takes several minutes)
   npx prisma db seed
   ```

3. **Create Environment File**:
   ```bash
   # Create .env file with your configuration
   cp .env.example .env  # Or create manually
   # Edit .env with your actual values
   ```

4. **Deploy Application**:
   ```bash
   docker-compose up -d app
   ```

#### Key Benefits

- **Latest Data**: Always uses the most current USDA nutrition data
- **Flexible Deployment**: Can be deployed anywhere Docker is available
- **Production Ready**: Includes health checks, proper restarts, and monitoring
- **Secure**: Environment variables for sensitive configuration
- **Scalable**: Easy to scale or migrate deployments

### Database Schema
```

### SMTP Configuration

The contact form on the privacy page requires SMTP configuration to send emails. Configure the following environment variables:

```env
# SMTP Configuration for Contact Form
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@archerhealth.com"

# Contact Email (where contact form messages are sent)
CONTACT_EMAIL="antonioarcher.dev@gmail.com"
```

#### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use your Gmail address as `SMTP_USER`
4. Use the App Password as `SMTP_PASS`
5. **Important**: Make sure "Less secure app access" is disabled (2FA + App Password is the secure way)

#### Troubleshooting Email Issues
If emails aren't being received:
1. Check your spam/junk folder
2. Verify the App Password is correct and hasn't expired
3. Try regenerating the App Password
4. Check Gmail security settings for blocked sign-ins
5. Test with the `/api/test-smtp` endpoint to verify connection

#### Testing SMTP Configuration
You can test your SMTP setup by visiting `http://localhost:3000/api/test-smtp` in your browser. This will verify the connection without sending an actual email.

#### Other Email Providers
The SMTP configuration works with most email providers. Common settings:

- **Gmail**: `smtp.gmail.com:587`
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`

## Error Handling

The application includes comprehensive error handling:

### Global Error Page (`app/error.tsx`)
- Catches unexpected application errors
- Automatically sends email notifications to admin in production
- Shows detailed error information in development mode
- Provides user-friendly error recovery options

### 404 Not Found Page (`app/not-found.tsx`)
- Custom 404 page with professional design
- Includes error reporting form for users to report broken links
- Sends detailed reports to admin email with context information

Both error pages use the same SMTP configuration as the contact form for sending notifications.

