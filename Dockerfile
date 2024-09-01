FROM node:18-alpine AS builder

WORKDIR /app


COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile


COPY . .

RUN npm run generate:prisma

RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start"]
