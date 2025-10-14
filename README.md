# Archer Health

## Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

## Database Setup

Archer Health uses PostgreSQL with Prisma ORM. The database includes both user-generated food data and verified USDA FoodData Central nutrition information.

### Local Development Database

For local development, use the provided Docker Compose setup:

```bash
# Start PostgreSQL database
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Seed with USDA FoodData (optional - includes 2M+ verified foods)
npx prisma db seed
```

### USDA FoodData Seeding

The application includes comprehensive USDA FoodData Central integration for verified nutrition data:

#### What Gets Seeded
- **2+ million foods** with verified nutritional information
- Complete nutrient profiles (proteins, carbs, fats, vitamins, minerals)
- Food categories and serving size data
- All data sourced from USDA's official FoodData Central database

#### Data Sources
- `data/FoodData_Central_csv_2025-04-24/` - Current USDA dataset
- Includes: food.csv, nutrient.csv, food_nutrient.csv, food_portion.csv, etc.
- Data is updated annually with new USDA releases

#### Updating USDA Data
When new USDA data is released (typically annually):

```bash
# 1. Download new CSV files from USDA
# 2. Replace contents of data/FoodData_Central_csv_2025-04-24/
# 3. Update folder name and seed script DATA_DIR if needed
# 4. Re-run seeding
npx prisma db seed
```

The seeding process is designed to be:
- **Non-destructive**: User foods remain untouched
- **Idempotent**: Can be run multiple times safely
- **Incremental**: New data can be added without conflicts

### Docker Deployment with Database Seeding

For production Docker deployments, the application automatically handles database setup and seeding:

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
# Build the application with embedded USDA data
docker build -t archer-health .

# Run with automatic seeding
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  archer-health
```

#### Database Seeding Helper Container

For complex deployments, you can use a dedicated seeding container:

```yaml
# docker-compose.yml with separate seeder
services:
  db:
    image: postgres:15-alpine
    # ... db config

  seeder:
    build:
      context: .
      dockerfile: Dockerfile.seeder
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/archer_health_db
    depends_on:
      - db
    profiles: ["seed"]  # Only run when explicitly requested

  app:
    build: .
    # ... app config
    depends_on:
      - db
      - seeder
```

```dockerfile
# Dockerfile.seeder
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY prisma/ ./prisma/
COPY data/ ./data/
RUN npx prisma generate
CMD ["npx", "prisma", "db", "seed"]
```

Run seeding separately:
```bash
# Seed the database
docker-compose --profile seed up seeder

# Then start the app
docker-compose up app
```

This approach provides:
- **Faster app startups** (seeding happens separately)
- **Better error handling** (seeding failures don't break app deployment)
- **Flexible deployments** (can seed existing databases)
- **Development workflow** (can reseed without rebuilding app)

### Database Schema

The database includes two main data categories:

1. **User Data**: Custom foods, meals, goals, achievements (user-generated)
2. **USDA Data**: Verified nutritional information (seeded from CSV)

Tables are designed to be modular - USDA data can be updated independently of user data.

### Quick Start Commands

#### Development
```bash
# Start everything
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate dev

# Seed USDA data
docker-compose --profile seed up seeder

# View logs
docker-compose logs -f app
```

#### Production
```bash
#### Production
```bash
# Build and deploy
docker-compose -f docker-compose.yml up --build -d

# Or use the helper seeder approach
docker-compose --profile seed up --build seeder
docker-compose up --build app
```

### Docker Hub Deployment

The application is designed for seamless Docker Hub deployment without requiring repository cloning:


#### Simple Docker Run (Single Container)

For simple deployments, you can use individual docker run commands. Set your environment variables using a `.env` file or export commands:

```bash
# Option 1: Source from .env file
set -a && source .env && set +a

# Option 2: Or export manually
export DB_PASSWORD="your_secure_password"
export DATABASE_URL="postgresql://postgres:$DB_PASSWORD@localhost:5432/archer_health_db"
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
export CLERK_SECRET_KEY="..."

# Start PostgreSQL
docker run -d --name archer-db \
  -e POSTGRES_DB=archer_health_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=$DB_PASSWORD \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for database to be ready
sleep 10

# Seed the database
docker run --rm \
  -e DATABASE_URL=$DATABASE_URL \
  yourusername/archer-health-seeder:latest

# Start the application
docker run -d --name archer-health \
  -e DATABASE_URL=$DATABASE_URL \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
  -e CLERK_SECRET_KEY=$CLERK_SECRET_KEY \
  -p 3000:3000 \
  yourusername/archer-health-app:latest
```

#### Production Docker Compose

Create a `docker-compose.yml` file with your Docker Hub username and a `.env` file for configuration:

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

  seeder:
    image: adarcher/archer-health-seeder:latest
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/archer_health_db
    depends_on:
      db:
        condition: service_healthy
    profiles: ["seed"]

  app:
    image: adarcher/archer-health:latest
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
      seeder:
        condition: service_completed_successfully
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

1. **Create Environment File**:
   ```bash
   # Create .env file with your configuration
   cp .env.example .env  # Or create manually
   # Edit .env with your actual values
   ```

2. **Update Docker Compose**:
   ```bash
   # Edit docker-compose.yml and replace 'yourusername' with your Docker Hub username
   ```

3. **Deploy Database & Seed**:
   ```bash
   docker-compose --profile seed up -d
   ```

4. **Start Application**:
   ```bash
   docker-compose up -d app
   ```

#### Key Benefits

- **No Repository Cloning Required**: Deploy directly from published images
- **Automatic USDA Data Seeding**: Images include embedded CSV data
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

