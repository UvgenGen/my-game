# Install dependencies only when needed
FROM node:16-alpine

RUN mkdir -p /app

WORKDIR /app

# Copy only the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000

CMD npm run dev
