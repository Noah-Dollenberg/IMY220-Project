# NJ (Noah) Dollenberg u24596142 41
FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "backend/server.js"]