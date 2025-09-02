# NJ (Noah) Dollenberg u24596142 41
FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "backend/server.js"]