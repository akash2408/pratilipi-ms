FROM node:alpine

WORKDIR /app/user

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 8001

CMD ["npm","run","dev"]