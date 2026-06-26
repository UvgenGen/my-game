# Install dependencies only when needed
FROM node:22-alpine

RUN mkdir -p /app

WORKDIR /app

# Copy only the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

EXPOSE 3000

CMD npm run dev
