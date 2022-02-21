FROM node:alpine

WORKDIR /app/story

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 8002

CMD ["npm","run","dev"]