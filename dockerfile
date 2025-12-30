FROM node:22-alpine3.23
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["sh", "-c", "npx prisma migrate dev && npx prisma generate && nest start --watch"]