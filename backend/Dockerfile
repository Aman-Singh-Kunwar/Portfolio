FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY node_modules ./node_modules
COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
