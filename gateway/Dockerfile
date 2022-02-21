FROM node:alpine

WORKDIR /app/gateway

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 8000

CMD ["npm","run","dev"]