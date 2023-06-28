# Install dependencies only when needed
FROM node:16-alpine

RUN mkdir -p /app

WORKDIR /app

COPY ./package.json ./
RUN npm i
COPY . .

EXPOSE 3000

CMD npm run dev