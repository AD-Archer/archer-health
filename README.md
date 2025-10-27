# Archer Health
![Archer Health banner](https://health.adarcher.app/banner.webp)

**Part of the Archer Life Suite** — A comprehensive health and wellness platform for calorie tracking, meal logging, and nutrition management.

Archer Health is a modern web application built with Next.js 15, offering nutrition tracking with over 10,000 foods, goal setting, progress analytics, and recipe discovery. It integrates verified USDA FoodData Central nutrition information for accurate calorie and nutrient calculations and TheMealDb for recipes.

## Quick Start

### 1. Source USDA Data
Download the latest USDA FoodData Central CSV files from [USDA FoodData Central](https://fdc.nal.usda.gov/download-datasets.html).

### 2. Clone and Setup
```bash
git clone https://github.com/AD-Archer/archer-health.git
cd archer-health
pnpm install
```

### 3. Place Data in Folder
Extract and place the CSV files in the `data/` folder. The folder should be named with the date, e.g., `data/FoodData_Central_csv_2025-04-24/`.


### 4. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your configuration (see Environment Setup section below)
```

### 5. Start Database and Seed
```bash
docker-compose up -d
npx prisma migrate dev
```

### 6. Seed Database (Takes ~1 Day)
The seeding process imports 2+ million foods and takes approximately 24 hours. Use tmux or screen to prevent the process from stopping if your connection drops:

```bash
tmux new -s seeding
npx prisma db seed
# Detach with Ctrl+B D, reattach with tmux attach -t seeding
```

### 7. Start Application
After seeding completes, you have two options:

**Option A: Delete repo and use Docker image**
```bash
# After seeding, you can delete the repo
rm -rf archer-health

# Run the pre-built Docker image
docker run -d \
  --name archer-health \
  -p 3000:3000 \
  --env-file .env \
  adarcher/archer-health:latest
```

**Option B: Build and run locally**
```bash
pnpm run build
pnpm run dev
```

### 8. Access Your Application
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

# Caching (Redis)
REDIS="redis://user:password@host:6379/0"
# Optional namespace for keys (matches Redis ACL patterns)
REDIS_KEY_PREFIX="archer-health"
# Optional TTL override in seconds (defaults to 300)
CACHE_TTL_SECONDS="300"
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

### Redis Caching
Redis is used to cache frequently requested nutrition and profile data, reducing Prisma load and speeding up responses. Provide a `REDIS` (or `REDIS_URL`) connection string in `.env`; the app safely falls back to live database queries if Redis is unreachable. Set `REDIS_KEY_PREFIX` if your Redis user has an ACL key pattern (for example `~archer_health_user:*`), and tune cache freshness via `CACHE_TTL_SECONDS` (default 5 minutes).

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

## Production Deployment

### Docker Compose (Recommended)
```yaml
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

### Standalone Docker
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

### Build from Source
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
