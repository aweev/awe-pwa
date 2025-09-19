# Makefile for Prisma and Next.js project

# Initialize Prisma
init:
	pnpm prisma init

# Run migrations
migrate:
	pnpm prisma migrate dev --name init

# Making further changes
added:
	pnpm prisma migrate dev --name added

# Generate Prisma Client
generate:
	pnpm prisma generate

# Apply migrations (for production or deployment)
deploy-migrate:
	pnpm prisma migrate deploy

# Reset database (use carefully in development)
reset:
	pnpm prisma migrate reset

# Seed the database
seed:
	pnpm prisma db seed

# Open Prisma Studio
studio:
	pnpm prisma studio

# Run all necessary Prisma commands
setup: init migrate generate seed
